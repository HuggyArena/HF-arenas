import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FaucetService } from './faucet.service';
import { MintFaucetDto } from './dto/mint-faucet.dto';

@ApiTags('Faucet')
@Controller('v1/faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  @Post('mint')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Mint 1 000 Play USDC to the given address (Play Money mode only)',
    description:
      'Requires ENABLE_FAUCET=true in the environment. Returns 403 in Real Money mode. ' +
      'Rate-limited to one request per address per 24 hours.',
  })
  @ApiResponse({ status: 200, description: 'Mint successful', schema: { example: { txHash: '0x...', amount: '1000000000' } } })
  @ApiResponse({ status: 403, description: 'Faucet disabled or rate limit exceeded' })
  async mint(@Body() dto: MintFaucetDto) {
    return this.faucetService.mint(dto.userAddress);
  }
}
