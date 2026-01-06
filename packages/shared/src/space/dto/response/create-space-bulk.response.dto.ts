import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSpaceResponseDto } from './create-space.response.dto';

export enum BULK_CREATE_RESULT {
  SUCCESS = 'SUCCESS',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  FAIL = 'FAIL',
}

export class CreateSpaceBulkResponseDto {
  @ApiProperty({
    example: BULK_CREATE_RESULT.SUCCESS,
    description: '전체 처리 결과',
    enum: BULK_CREATE_RESULT,
  })
  @IsEnum(BULK_CREATE_RESULT)
  status: BULK_CREATE_RESULT;

  @ApiProperty({
    type: [CreateSpaceResponseDto],
    description: '각 스페이스별 생성 결과',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpaceResponseDto)
  results: CreateSpaceResponseDto[];

  constructor(status: BULK_CREATE_RESULT, results: CreateSpaceResponseDto[]) {
    this.status = status;
    this.results = results;
  }
}
