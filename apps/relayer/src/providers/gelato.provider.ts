import { Injectable } from '@nestjs/common';
import { CallWithERC2771Request, GelatoRelay } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';

@Injectable()
export class GelatoProvider {
  private readonly relay = new GelatoRelay();
  private readonly apiKey = process.env.GELATO_API_KEY!;
  // Gelato SDK's SignerOrProvider is typed as `BrowserProvider | Signer`, so
  // we wrap an RPC provider in a Wallet. The private key is not used to sign
  // the meta-transaction (the user's EIP-712 signature lives inside `request`);
  // the sponsor is still billed via `apiKey`. The Wallet exists only to
  // satisfy the SDK's type and read-side RPC calls.
  private readonly signer = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    new ethers.JsonRpcProvider(process.env.RPC_URL),
  );

  async sponsorCallERC2771(request: CallWithERC2771Request) {
    const response = await this.relay.sponsoredCallERC2771(request, this.signer, this.apiKey, {
      retries: 3,
      gasLimit: 500000n,
    });

    return { taskId: response.taskId };
  }

  async getTaskStatus(taskId: string) {
    return this.relay.getTaskStatus(taskId);
  }
}
