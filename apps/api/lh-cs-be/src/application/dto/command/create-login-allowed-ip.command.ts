import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIP,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLoginAllowedIpCommand {
  @ApiProperty({
    description: '관리할 IP 주소(저장 시 암호화 처리)',
    example: '203.0.113.10',
  })
  @IsString()
  @IsIP()
  ipAddress: string;

  @ApiPropertyOptional({
    description: 'IP에 대한 설명',
    example: '서울 본사 VPN',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: '허용 여부 (true: 허용, false: 차단)',
    default: true,
  })
  @IsBooleanAndBooleanString({ optional: true })
  isAllowed?: boolean = true;
}
