import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CallWithERC2771Request, GelatoRelay } from '@gelatonetwork/relay-sdk';

@Injectable()
export class GelatoProvider implements OnModuleInit {
  private readonly logger = new Logger(GelatoProvider.name);
  private readonly relay = new GelatoRelay();
  private readonly apiKey: string;

  constructor() {
    const key = process.env.GELATO_API_KEY;
    if (!key) {
      throw new Error('GELATO_API_KEY environment variable is required');
    }
    this.apiKey = key;
  }

  onModuleInit() {
    this.logger.log('Gelato relay provider initialized');
  }

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
