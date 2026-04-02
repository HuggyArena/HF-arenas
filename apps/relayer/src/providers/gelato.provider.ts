import { Injectable } from '@nestjs/common';
import { CallWithERC2771Request, GelatoRelay, SignerOrProvider } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';

@Injectable()
export class GelatoProvider {
  private readonly relay = new GelatoRelay();
  private readonly apiKey = process.env.GELATO_API_KEY!;

  async sponsorCallERC2771(request: CallWithERC2771Request, signer: ethers.Signer) {
    // Cast required: app ethers version may differ from Gelato SDK's bundled ethers
    const response = await this.relay.sponsoredCallERC2771(
      request,
      signer as unknown as SignerOrProvider,
      this.apiKey,
      { retries: 3, gasLimit: BigInt(500000) },
    );

    return { taskId: response.taskId };
  }

  async getTaskStatus(taskId: string) {
    return this.relay.getTaskStatus(taskId);
  }
}
