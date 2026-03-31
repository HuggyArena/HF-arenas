import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RelayService } from './relay.service';
import { SubmitRelayDto, RelayResponseDto, OracleSignatureDto, normalizeAddress } from './dto/relay.dto';
import { SanctionsGuard } from './compliance/guards/sanctions.guard';

@ApiTags('Transaction Relay')
@Controller('v1/relay')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit gasless transaction via Gelato ERC2771' })
  @ApiResponse({ status: 201, type: RelayResponseDto })
  @UseGuards(SanctionsGuard)
  async submit(@Body() dto: SubmitRelayDto): Promise<RelayResponseDto> {
    const normalizedDto = {
      ...dto,
      target: normalizeAddress(dto.target),
      userAddress: normalizeAddress(dto.userAddress),
    };
    return this.relayService.submit(normalizedDto);
  }

  @Post('signature')
  @ApiOperation({ summary: 'Oracle signs bet parameters (pre-relay)' })
  async getSignature(@Body() dto: OracleSignatureDto) {
    return this.relayService.generateOracleSignature(dto);
  }

  @Post('status')
  @ApiOperation({ summary: 'Check relay task status' })
  async getStatus(@Body('taskId') taskId: string) {
    if (!taskId) throw new BadRequestException('taskId is required');
    return this.relayService.getTaskStatus(taskId);
  }
}
