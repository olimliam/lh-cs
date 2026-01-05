import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTourCommand {
  @ApiProperty({
    description: '투어 접근 ID',
    example: 'tour_84_a_type',
  })
  @IsNotEmpty({ message: '투어 ID는 필수입니다.' })
  @IsString({ message: '투어 ID는 문자열이어야 합니다.' })
  @MaxLength(200, { message: '투어 ID는 200자 이하여야 합니다.' })
  tourId: string;

  @ApiProperty({
    description: '평형 제곱미터',
    example: 84,
  })
  @IsNotEmpty({ message: '평형은 필수입니다.' })
  @IsNumber({}, { message: '평형은 숫자여야 합니다.' })
  @Min(1, { message: '평형은 1 이상이어야 합니다.' })
  squareMeters: number;

  @ApiProperty({
    description: '평형 정보 제목',
    example: '84㎡ A타입',
  })
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '제목은 50자 이하여야 합니다.' })
  title: string;

  @ApiProperty({
    description: '투어 설명',
    example: '넓은 거실과 3개의 방이 있는 84평형 A타입 투어입니다.',
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
