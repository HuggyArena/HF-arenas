import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@arena/shared-prisma';
import crypto from 'crypto';

@Injectable()
export class SumsubProvider {
  private readonly logger = new Logger(SumsubProvider.name);
  private readonly baseUrl = 'https://api.sumsub.com';
  private readonly appToken = process.env.SUMSUB_APP_TOKEN || '';
  private readonly secretKey = process.env.SUMSUB_SECRET_KEY || '';

  constructor(private readonly prisma: PrismaService) {}

  async createApplicant(userId: string, levelName: string) {
    const timestamp = Date.now();
    const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
    const body = JSON.stringify({ externalUserId: userId });
    const signature = this.sign('POST', path, timestamp, body);

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'X-App-Token': this.appToken,
        'X-App-Access-Sig': signature,
        'X-App-Access-Ts': timestamp.toString(),
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      throw new BadRequestException(`Sumsub API error: ${response.status}`);
    }

    return response.json();
  }

  async handleWebhook(rawBody: Buffer, signature: string, payloadDigest?: string) {
    if (!this.verifyWebhook(rawBody, signature, payloadDigest)) {
      this.logger.error('Invalid Sumsub webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid JSON payload');
    }

    if (!payload.externalUserId) throw new BadRequestException('Missing externalUserId');

    await this.prisma.user.update({
      where: { id: payload.externalUserId },
      data: {
        kycStatus: payload.reviewResult?.reviewStatus ?? 'unknown',
        kycLevel: payload.levelName ?? 'unknown',
      },
    });

    this.logger.log(`Updated KYC status for user ${payload.externalUserId}`);
  }

  private sign(method: string, path: string, ts: number, body: string) {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(`${ts}${method.toUpperCase()}${path}${body}`)
      .digest('hex');
  }

  private verifyWebhook(rawBody: Buffer, sig: string, payloadDigest?: string): boolean {
    const calculated = crypto.createHmac('sha256', this.secretKey).update(rawBody).digest('hex');

    const safeCompare = (a: string, b: string) => {
      try {
        const ab = Buffer.from(a, 'hex');
        const bb = Buffer.from(b, 'hex');
        return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
      } catch {
        return false;
      }
    };

    if (payloadDigest && !safeCompare(calculated, payloadDigest)) return false;
    return safeCompare(calculated, sig);
  }
}
