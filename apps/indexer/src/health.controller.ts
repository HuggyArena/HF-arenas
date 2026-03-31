import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { ok: true, service: 'indexer', timestamp: new Date().toISOString() };
  }
}
