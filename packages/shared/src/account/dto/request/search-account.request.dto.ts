import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchAccountRequestDto {
  @ApiProperty({
    example: 'tester',
    description: '사용자 ID',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'elypecs',
    description: '프로젝트 이름',
  })
  @IsString()
  projectName: string;

  constructor(dto: SearchAccountRequestDto) {
    this.username = dto.username;
    this.projectName = dto.projectName;
  }
}
