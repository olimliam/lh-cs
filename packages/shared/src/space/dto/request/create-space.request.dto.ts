import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSpaceRequestDto {
  @ApiProperty({
    example: 'space-123',
    description: '스페이스 아이디',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    example: true,
    description: '사용 가능 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({
    example: true,
    description: '예약 사용 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  useReservation?: boolean;

  @ApiProperty({
    example: true,
    description: '화면 공유 캔버스 기능 사용 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  useScreenShareCanvas?: boolean;

  @ApiProperty({
    example: true,
    description: '파일 채팅 사용 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  useFileChat?: boolean;
}
