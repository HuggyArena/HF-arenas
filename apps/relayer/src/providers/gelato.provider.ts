import { Injectable } from '@nestjs/common';
import { CallWithERC2771Request, GelatoRelay, type SignerOrProvider } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';

@Injectable()
export class GelatoProvider {
  private readonly relay = new GelatoRelay();
  private readonly apiKey: string;
  private readonly signer: ethers.Signer;

  constructor() {
    const apiKey = process.env.GELATO_API_KEY;
    if (!apiKey) {
      throw new Error('GELATO_API_KEY is required but not configured');
    }

    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC_URL is required but not configured');
    }

    const oracleKey = process.env.ORACLE_PRIVATE_KEY;
    if (!oracleKey) {
      throw new Error('ORACLE_PRIVATE_KEY is required but not configured');
    }

    this.apiKey = apiKey;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(oracleKey, provider);
  }

  async sponsorCallERC2771(request: CallWithERC2771Request) {
    const signer = this.signer as SignerOrProvider;
    const response = await this.relay.sponsoredCallERC2771(request, signer, this.apiKey, {
      retries: 3,
      gasLimit: BigInt(500000),
    });

    return { taskId: response.taskId };
  }

  async getTaskStatus(taskId: string) {
    return this.relay.getTaskStatus(taskId);
  }
}
