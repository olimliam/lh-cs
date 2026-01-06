import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export declare class UpdateReservationRequestDto {
  @ApiProperty({
    example: false,
    description: 'reservation id',
  })
  @IsString()
  id: number;

  @ApiProperty({
    example: false,
    description: '스페이스 아이디',
  })
  @IsString()
  spaceId: string;

  @ApiProperty({
    example: false,
    description: '예약 시작 일시',
  })
  @IsString()
  startDate: Date;

  @ApiProperty({
    example: false,
    description: '예약 종료 일시',
  })
  @IsString()
  endDate: Date;

  @ApiProperty({
    example: false,
    description: '예약자 성명',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: false,
    description: '이메일',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: false,
    description: '휴대폰 번호',
  })
  @IsString()
  phoneNumber?: string;
}
