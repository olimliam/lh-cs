import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateIf } from 'class-validator';

export enum CREATE_RESULT {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export class CreateSpaceResponseDto {
  @ApiProperty({
    example: 'space-123',
    description: '스페이스 아이디',
    required: false,
  })
  @ValidateIf((o) => o.result === CREATE_RESULT.SUCCESS)
  @IsString()
  spaceId?: string;

  @ApiProperty({
    example: CREATE_RESULT.SUCCESS,
    description: 'create 결과',
  })
  @IsString()
  result: CREATE_RESULT;

  constructor(result: CREATE_RESULT, spaceId?: string) {
    this.result = result;
    if (spaceId) {
      this.spaceId = spaceId;
    }
  }
}
