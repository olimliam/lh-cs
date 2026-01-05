import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIP, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLoginAllowedIpCommand {
  @ApiPropertyOptional({
    description: '관리할 IP 주소(저장 시 암호화 처리)',
    example: '203.0.113.50',
  })
  @IsOptional()
  @IsString()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'IP에 대한 설명',
    example: '지점 회선',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: '허용 여부 (true: 허용, false: 차단)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowered = value.toLowerCase();
      if (lowered === 'true') return true;
      if (lowered === 'false') return false;
    }
    return value;
  })
  isAllowed?: boolean;
}
