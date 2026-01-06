import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReservationResponseDto {
  @ApiProperty({
    example: false,
    description: '예약 번호',
  })
  @IsString()
  reservationToken: string;

  constructor(reservationToken: string) {
    this.reservationToken = reservationToken;
  }
}
