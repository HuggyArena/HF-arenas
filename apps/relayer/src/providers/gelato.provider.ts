import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { CallWithERC2771Request, GelatoRelay } from '@gelatonetwork/relay-sdk';

@Injectable()
export class GelatoProvider {
  private readonly relay = new GelatoRelay();
  private readonly apiKey = process.env.GELATO_API_KEY!;
  private readonly signer = new ethers.Wallet(
    process.env.ORACLE_PRIVATE_KEY!,
    new ethers.JsonRpcProvider(process.env.RPC_URL!),
  );

  async sponsorCallERC2771(request: CallWithERC2771Request) {
    const response = await this.relay.sponsoredCallERC2771(
      request,
      this.signer as any, // ethers version mismatch between relayer and @gelatonetwork/relay-sdk
      this.apiKey,
      {
        retries: 3,
        gasLimit: 500000n,
      },
    );

    return { taskId: response.taskId };
  }

  async getTaskStatus(taskId: string) {
    return this.relay.getTaskStatus(taskId);
  }
}
