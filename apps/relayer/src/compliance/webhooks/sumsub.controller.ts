import { BadRequestException, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SumsubProvider } from '../providers/sumsub.provider';

@ApiTags('Compliance Webhooks')
@Controller('webhooks/sumsub')
export class SumsubController {
  constructor(private readonly sumsub: SumsubProvider) {}

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-app-secret') signature: string,
    @Headers('x-payload-digest') payloadDigest?: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody || rawBody.length === 0) {
      throw new BadRequestException('Empty body');
    }

    await this.sumsub.handleWebhook(rawBody, signature, payloadDigest);
    return { received: true, timestamp: new Date().toISOString() };
  }
}
