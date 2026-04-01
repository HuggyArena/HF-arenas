import { IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MintFaucetDto {
  @ApiProperty({ description: 'Recipient wallet address', example: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B' })
  @IsEthereumAddress()
  userAddress!: string;
}
