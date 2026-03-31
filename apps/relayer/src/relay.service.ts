import {
  BadRequestException,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from '@arena/shared-prisma';
import { GelatoProvider } from './providers/gelato.provider';

type OracleSignatureDto = {
  user: string;
  outcome: string;
  amount: string;
  nonce?: number;
  marketAddress: string;
  chainId: number;
};

type SubmitRelayInput = {
  chainId: number;
  target: string;
  userAddress: string;
  marketId: string;
  amount: string;
  data: string;
  deadline?: number;
};

/** Maximum seconds a deadline may be ahead of now — must match ArenaMarket.placeBet */
const DEADLINE_MAX_FUTURE_SECONDS = 300;
/** Expected string length of a 0x-prefixed bytes32 hex value (32 bytes × 2 hex chars + 2). */
const BYTES32_HEX_FULL_LENGTH = 66;

@Injectable()
export class RelayService implements OnApplicationShutdown {
  private readonly logger = new Logger(RelayService.name);
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();
  private readonly MAX_POLLING_DURATION = 15 * 60 * 1000;
  private shuttingDown = false;

  /** Lazily-created, singleton provider reused across requests. */
  private rpcProvider: ethers.JsonRpcProvider | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gelato: GelatoProvider,
  ) {}

  async generateOracleSignature(dto: OracleSignatureDto) {
    if (!ethers.isAddress(dto.user)) throw new BadRequestException('Invalid user address');
    if (!ethers.isAddress(dto.marketAddress)) throw new BadRequestException('Invalid market address');

    const nonce = dto.nonce ?? Math.floor(Date.now() / 1000);
    const deadline = Math.floor(Date.now() / 1000) + DEADLINE_MAX_FUTURE_SECONDS;

    const domain = {
      name: 'ArenaMarket',
      version: '1',
      chainId: dto.chainId,
      verifyingContract: ethers.getAddress(dto.marketAddress),
    };

    const types = {
      Bet: [
        { name: 'market', type: 'address' },
        { name: 'user', type: 'address' },
        { name: 'outcome', type: 'bytes32' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    // Ensure outcome is a 32-byte hex string as expected by the contract.
    // Callers may pass a pre-encoded bytes32 hex or a short string label.
    let outcomeBytes32: string;
    if (/^0x[0-9a-fA-F]{64}$/.test(dto.outcome) && dto.outcome.length === BYTES32_HEX_FULL_LENGTH) {
      outcomeBytes32 = dto.outcome;
    } else {
      outcomeBytes32 = ethers.encodeBytes32String(dto.outcome);
    }

    const value = {
      market: ethers.getAddress(dto.marketAddress),
      user: ethers.getAddress(dto.user),
      outcome: outcomeBytes32,
      amount: dto.amount,
      nonce,
      deadline,
    };

    const oracleKey = process.env.ORACLE_PRIVATE_KEY;
    if (!oracleKey) throw new BadRequestException('Oracle signing key not configured');

    const wallet = new ethers.Wallet(oracleKey);
    const signature = await wallet.signTypedData(domain, types, value);
    return { nonce, signature, deadline, marketAddress: dto.marketAddress };
  }

  async submit(dto: SubmitRelayInput) {
    await this.checkSanctions(dto.userAddress);
    await this.validateBalance(dto.userAddress, dto.amount);
    await this.validateDeadline(dto.deadline);

    const idempotencyKey = ethers.keccak256(
      ethers.toUtf8Bytes(
        `${dto.userAddress}-${dto.target}-${dto.amount}-${dto.marketId}-${Math.floor(Date.now() / 30000)}`,
      ),
    );

    const existing = await this.prisma.relayedTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return {
        taskId: existing.gelatoTaskId,
        estimatedExecution: 0,
        txHash: existing.txHash,
        status: existing.status,
      };
    }

    const relayResult = await this.gelato.sponsorCallERC2771({
      chainId: dto.chainId,
      target: dto.target,
      data: dto.data,
      user: dto.userAddress,
    } as any);

    const tx = await this.prisma.relayedTransaction.create({
      data: {
        idempotencyKey,
        userAddress: dto.userAddress,
        target: dto.target,
        amount: dto.amount,
        marketId: dto.marketId,
        chainId: dto.chainId,
        gelatoTaskId: relayResult.taskId,
        status: 'PENDING',
      },
    });

    this.pollForCompletion(tx.id, relayResult.taskId).catch((err) => {
      this.logger.error('Relay polling failed', err as any);
    });

    return {
      taskId: relayResult.taskId,
      estimatedExecution: 15,
      txHash: null,
      status: 'PENDING',
    };
  }

  async getTaskStatus(taskId: string) {
    return this.gelato.getTaskStatus(taskId);
  }

  onApplicationShutdown() {
    this.shuttingDown = true;
    this.activeTimers.forEach((timer) => clearInterval(timer));
    this.activeTimers.clear();
    this.logger.log('Cleaned up relay polling timers');
  }

  private async validateDeadline(deadline?: number) {
    if (!deadline) return;
    const now = Math.floor(Date.now() / 1000);
    if (deadline < now) throw new BadRequestException('Transaction deadline expired');
    if (deadline > now + DEADLINE_MAX_FUTURE_SECONDS) {
      throw new BadRequestException(`Deadline too far in future (max ${DEADLINE_MAX_FUTURE_SECONDS}s)`);
    }
  }

  private async checkSanctions(address: string) {
    const cached = await this.prisma.sanctionCheck.findFirst({
      where: {
        address,
        checkedAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (cached?.severity === 'HIGH' || cached?.severity === 'SEVERE') {
      throw new BadRequestException('Address restricted by compliance policy');
    }
  }

  private getProvider(): ethers.JsonRpcProvider {
    if (!this.rpcProvider) {
      const rpcUrl = process.env.RPC_URL;
      if (!rpcUrl) throw new BadRequestException('RPC_URL not configured');
      this.rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
    }
    return this.rpcProvider;
  }

  private async validateBalance(user: string, amount: string) {
    const usdcAddress = process.env.USDC_ADDRESS;
    if (!usdcAddress) throw new BadRequestException('USDC address not configured');
    const usdc = new ethers.Contract(
      usdcAddress,
      ['function balanceOf(address) view returns (uint256)'],
      this.getProvider(),
    );
    const balance: bigint = await usdc.balanceOf(user);
    if (balance < BigInt(amount)) throw new BadRequestException('Insufficient USDC balance');
  }

  private async pollForCompletion(dbId: string, taskId: string) {
    if (this.shuttingDown) return;

    const safetyTimeout = setTimeout(() => {
      const timer = this.activeTimers.get(taskId);
      if (timer) {
        clearInterval(timer);
        this.activeTimers.delete(taskId);
        this.logger.warn(`Force cleared timer for ${taskId}`);
      }
    }, this.MAX_POLLING_DURATION);

    let attempts = 0;
    const timer = setInterval(async () => {
      if (this.shuttingDown) {
        this.clearTimer(taskId, safetyTimeout);
        return;
      }

      attempts += 1;
      try {
        const status = await this.gelato.getTaskStatus(taskId);
        if (status.taskState === 'ExecSuccess') {
          await this.prisma.relayedTransaction.update({
            where: { id: dbId },
            data: { status: 'EXECUTED', txHash: status.transactionHash, executedAt: new Date() },
          });
          this.clearTimer(taskId, safetyTimeout);
        } else if (status.taskState === 'ExecReverted' || attempts > 60) {
          await this.prisma.relayedTransaction.update({
            where: { id: dbId },
            data: { status: 'FAILED', error: status.lastCheckMessage ?? 'Polling timeout exceeded' },
          });
          this.clearTimer(taskId, safetyTimeout);
        }
      } catch (error) {
        this.logger.error(`Polling error for ${taskId}`, error as any);
        if (attempts > 60) this.clearTimer(taskId, safetyTimeout);
      }
    }, 15000);

    this.activeTimers.set(taskId, timer);
  }

  private clearTimer(taskId: string, safetyTimeout: NodeJS.Timeout) {
    const timer = this.activeTimers.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(taskId);
    }
    clearTimeout(safetyTimeout);
  }
}
