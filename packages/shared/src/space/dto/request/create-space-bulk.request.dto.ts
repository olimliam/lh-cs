import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSpaceRequestDto } from './create-space.request.dto';

export class CreateSpaceBulkRequestDto {
  @ApiProperty({
    type: [CreateSpaceRequestDto],
    description: '생성할 스페이스 목록',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateSpaceRequestDto)
  spaces!: CreateSpaceRequestDto[];
}
