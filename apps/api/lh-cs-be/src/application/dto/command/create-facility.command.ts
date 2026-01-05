import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilityCommand {
  @ApiProperty({
    description: '시설명',
    example: '거실 조명',
  })
  @IsNotEmpty({ message: '시설명은 필수입니다.' })
  @IsString({ message: '시설명은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '시설명은 50자 이하여야 합니다.' })
  title: string;

  @ApiProperty({
    description: '시설 설명',
    example: '거실 중앙에 위치한 메인 조명입니다.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(255, { message: '설명은 255자 이하여야 합니다.' })
  description?: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '활성화 여부는 불린값이어야 합니다.' })
  isActive?: boolean = true;
}
