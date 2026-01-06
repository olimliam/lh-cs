import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

enum UPDATE_RESULT {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export class UpdateReservationResponseDto {
  @ApiProperty({
    example: false,
    description: 'update 결과',
  })
  @IsString()
  result: UPDATE_RESULT;

  constructor(result: UPDATE_RESULT) {
    this.result = result;
  }
}
