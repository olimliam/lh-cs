import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteReservationRequestDto {
  @ApiProperty({
    example: '',
    description: '예약 번호',
  })
  @IsString()
  reservationToken!: string;
}
