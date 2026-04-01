import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';
import { GelatoProvider } from './providers/gelato.provider';
import { ComplianceModule } from './compliance/compliance.module';
import { PrismaModule } from '@arena/shared-prisma';
import { HealthController } from './health.controller';
import { FaucetModule } from './faucet/faucet.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ComplianceModule, PrismaModule, FaucetModule],
  controllers: [RelayController, HealthController],
  providers: [RelayService, GelatoProvider],
})
export class AppModule {}
