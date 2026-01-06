import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateProjectRequestDto {
  @ApiProperty({
    example: 'elypecs',
    description: '서비스 명',
  })
  @IsString()
  projectName!: string;
  @ApiProperty({
    example: false,
    description: '프로젝트 비활성화 상태',
  })
  @IsBoolean()
  isDeleted!: boolean;
}
