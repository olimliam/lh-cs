import { IsNumber } from 'class-validator';
import { CreateProjectRequestDto } from './create-project.request.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectRequestDto extends CreateProjectRequestDto {
  @ApiProperty({
    example: 1,
    description: '수정 할 업데이트 ID',
  })
  @IsNumber()
  id!: number;
}
