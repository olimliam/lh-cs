import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

enum DELETE_RESULT {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export class DeleteReservationResponseDto {
  @ApiProperty({
    example: false,
    description: 'delete 결과',
  })
  @IsString()
  result: DELETE_RESULT;

  constructor(result: DELETE_RESULT) {
    this.result = result;
  }
}
