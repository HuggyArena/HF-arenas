import { ForbiddenException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ethers } from 'ethers';

/** Amount dispensed per request: 1 000 Play USDC (6 decimals). */
const FAUCET_AMOUNT = 1_000n * 1_000_000n;

/** 24 hours expressed in milliseconds. */
const RATE_LIMIT_MS = 24 * 60 * 60 * 1_000;

/** Minimal ABI — only the `mint` function is needed. */
const MOCK_USDC_ABI = ['function mint(address to, uint256 amount) external'];

@Injectable()
export class FaucetService {
  private readonly logger = new Logger(FaucetService.name);

  /**
   * In-memory rate-limit store: address (lowercase) → timestamp of last successful mint.
   * For a production deployment this should be replaced with a Redis-backed store.
   */
  private readonly lastMintAt = new Map<string, number>();

  async mint(userAddress: string): Promise<{ txHash: string; amount: string }> {
    if (process.env.ENABLE_FAUCET !== 'true') {
      throw new ForbiddenException('Faucet disabled in real-money mode');
    }

    const usdcAddress = process.env.USDC_ADDRESS;
    if (!usdcAddress || !ethers.isAddress(usdcAddress)) {
      throw new ServiceUnavailableException('MockUSDC address not configured (USDC_ADDRESS)');
    }

    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!privateKey) {
      throw new ServiceUnavailableException('Faucet signer not configured (ORACLE_PRIVATE_KEY)');
    }

    // ── 24-hour rate limit per address ───────────────────────────────────────
    const key = userAddress.toLowerCase();
    const last = this.lastMintAt.get(key) ?? 0;
    const now = Date.now();
    if (now - last < RATE_LIMIT_MS) {
      const retryAfterSec = Math.ceil((RATE_LIMIT_MS - (now - last)) / 1_000);
      throw new ForbiddenException(
        `Rate limit: this address may only use the faucet once per 24 hours. Retry in ${retryAfterSec}s.`,
      );
    }

    // ── On-chain mint ─────────────────────────────────────────────────────────
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    const mockUsdc = new ethers.Contract(usdcAddress, MOCK_USDC_ABI, signer);

    let txHash: string;
    try {
      const tx: ethers.ContractTransactionResponse = await mockUsdc.mint(userAddress, FAUCET_AMOUNT);
      await tx.wait();
      txHash = tx.hash;
    } catch (err) {
      this.logger.error('Faucet mint failed', err as Error);
      throw new ServiceUnavailableException('Faucet mint transaction failed — see server logs');
    }

    // Record successful mint time only after the tx is confirmed.
    this.lastMintAt.set(key, Date.now());

    this.logger.log(`Faucet minted ${FAUCET_AMOUNT} MockUSDC to ${userAddress} — tx: ${txHash}`);
    return { txHash, amount: FAUCET_AMOUNT.toString() };
  }
}
