import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import { ethers } from 'ethers';

/** Supported chain IDs for relay submission. */
const SUPPORTED_CHAINS = [137, 80002]; // Polygon mainnet, Amoy testnet

export class SubmitRelayDto {
  @ApiProperty({ description: 'Optional user-signed forward request payload', required: false })
  @IsOptional()
  @IsString()
  signedRequest?: string;

  @ApiProperty({ description: 'Target contract address (checksummed)', example: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Must be valid Ethereum address hex' })
  target!: string;

  @ApiProperty({ description: 'Chain ID (137 = Polygon mainnet, 80002 = Amoy testnet)', example: 137 })
  @IsInt()
  @Min(1, { message: 'chainId must be a positive integer' })
  chainId!: number;

  @ApiProperty({ description: 'User address (checksummed)', example: '0x0000000000000000000000000000000000000001' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userAddress!: string;

  @ApiProperty({ description: 'Market ID correlation key', example: 'hf-top-001' })
  @IsString()
  @IsNotEmpty({ message: 'marketId must not be empty' })
  @Length(1, 255, { message: 'marketId must be 1-255 characters' })
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'marketId must be alphanumeric with . _ -' })
  marketId!: string;

  @ApiProperty({ description: 'USDC amount in base units (6 decimals). Min 1, max 100 000 000 000 (100k USDC).', example: '1000000' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'Amount must be a positive numeric string without leading zeros' })
  @Length(1, 12, { message: 'Amount string must be 1-12 digits (max 100 000 000 000)' })
  amount!: string;

  @ApiProperty({ description: 'Forwarded calldata payload (hex)', example: '0x' })
  @IsString()
  @Length(2, 131072, { message: 'data must be 2-131072 characters (max 64KB calldata)' })
  @Matches(/^0x[a-fA-F0-9]*$/, { message: 'Must be valid hex' })
  data!: string;

  @ApiProperty({ description: 'Signature deadline unix timestamp (max 6 min in future)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'deadline must be a non-negative integer' })
  deadline?: number;
}

export class OracleSignatureDto {
  @ApiProperty({ description: 'User wallet address' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Must be valid Ethereum address hex' })
  user!: string;

  @ApiProperty({ description: 'Outcome identifier (bytes32 hex)' })
  @IsString()
  @IsNotEmpty()
  outcome!: string;

  @ApiProperty({ description: 'Bet amount in base units' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'Amount must be a positive numeric string' })
  @Length(1, 12, { message: 'Amount string must be 1-12 digits' })
  amount!: string;

  @ApiProperty({ description: 'Replay-protection nonce (required; use a unique integer per request)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  nonce?: number;

  @ApiProperty({ description: 'Market contract address' })
  @IsString()
  @Length(42, 42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Must be valid Ethereum address hex' })
  marketAddress!: string;

  @ApiProperty({ description: 'Target chain ID', example: 137 })
  @IsInt()
  @Min(1)
  chainId!: number;
}

export class TaskStatusDto {
  @ApiProperty({ description: 'Gelato relay task ID' })
  @IsString()
  @IsNotEmpty({ message: 'taskId must not be empty' })
  @Length(1, 255)
  taskId!: string;
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

export function normalizeAddress(address: string): string {
  try {
    return ethers.getAddress(address).toLowerCase();
  } catch {
    throw new Error(`Invalid address: ${address}`);
  }
}
