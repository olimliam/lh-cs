import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationRequestDto {
  @ApiProperty({
    example: false,
    description: '스페이스 아이디',
  })
  @IsString()
  spaceId!: string;

  @ApiProperty({
    example: false,
    description: '예약 시작 일시',
  })
  @IsDate()
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({
    example: false,
    description: '예약 종료 일시',
  })
  @IsDate()
  @IsNotEmpty()
  endDate!: Date;

  @ApiProperty({
    example: false,
    description: '예약자 성명',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: false,
    description: '예약자 이메일',
  })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: false,
    description: '휴대폰 번호',
  })
  @IsString()
  phoneNumber?: string;

  @IsString()
  reservationToken?: string;
}
