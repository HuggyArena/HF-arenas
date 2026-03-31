import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@arena/shared-prisma';
import { HealthController } from './health.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [HealthController],
  providers: [SyncService],
})
export class AppModule {}
