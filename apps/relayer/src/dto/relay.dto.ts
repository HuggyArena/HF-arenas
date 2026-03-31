import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

export class SubmitRelayDto {
  @ApiProperty({ description: 'Optional user-signed forward request payload', required: false })
  @IsOptional()
  @IsString()
  signedRequest?: string;

  @ApiProperty({ description: 'Target contract address (checksummed)' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Must be valid Ethereum address hex' })
  target!: string;

  @ApiProperty({ description: 'Chain ID', example: 137 })
  @IsInt()
  chainId!: number;

  @ApiProperty({ description: 'User address (checksummed)' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userAddress!: string;

  @ApiProperty({ description: 'Market ID correlation key' })
  @IsString()
  marketId!: string;

  @ApiProperty({ description: 'USDC amount in base units (6 decimals)' })
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Amount must be numeric string' })
  amount!: string;

  @ApiProperty({ description: 'Forwarded calldata payload (hex)' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]*$/, { message: 'Must be valid hex' })
  data!: string;

  @ApiProperty({ description: 'Signature deadline unix timestamp', required: false })
  @IsOptional()
  @IsInt()
  deadline?: number;
}

export class RelayResponseDto {
  @ApiProperty()
  taskId!: string;
  @ApiProperty()
  estimatedExecution!: number;
  @ApiProperty({ nullable: true })
  txHash!: string | null;
  @ApiProperty({ enum: ['PENDING', 'EXECUTED', 'FAILED'] })
  status!: string;
}

export class OracleSignatureDto {
  @ApiProperty({ description: 'User wallet address' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Must be valid Ethereum address hex' })
  user!: string;

  @ApiProperty({ description: 'Bet outcome (bytes32 hex)' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'Must be valid bytes32 hex' })
  outcome!: string;

  @ApiProperty({ description: 'USDC amount in base units (6 decimals)' })
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Amount must be numeric string' })
  amount!: string;

  @ApiProperty({ description: 'Optional nonce override', required: false })
  @IsOptional()
  @IsInt()
  nonce?: number;

  @ApiProperty({ description: 'Market contract address' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Must be valid Ethereum address hex' })
  marketAddress!: string;

  @ApiProperty({ description: 'Chain ID', example: 137 })
  @IsInt()
  chainId!: number;
}

export function normalizeAddress(address: string): string {
  try {
    return ethers.getAddress(address).toLowerCase();
  } catch {
    throw new BadRequestException(`Invalid address: ${address}`);
  }
}
