import { Injectable } from '@nestjs/common';
import { CallWithERC2771Request, GelatoRelay } from '@gelatonetwork/relay-sdk';

@Injectable()
export class GelatoProvider {
  private readonly relay = new GelatoRelay();
  private readonly apiKey = process.env.GELATO_API_KEY!;

  async sponsorCallERC2771(request: CallWithERC2771Request) {
    const response = await this.relay.sponsoredCallERC2771(request, this.apiKey, {
      retries: 3,
      gasLimit: '500000',
    });

    return { taskId: response.taskId };
  }

  async getTaskStatus(taskId: string) {
    return this.relay.getTaskStatus(taskId);
  }
}
