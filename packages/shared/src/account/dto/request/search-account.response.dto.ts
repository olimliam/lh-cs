import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SearchAccountResponseDto {
  @ApiProperty({
    example: 1,
    description: '계정 ID',
  })
  @IsNumber()
  accountId: number;

  @ApiProperty({
    example: 1,
    description: '계정 권한 ID',
  })
  @IsNumber()
  accountRoleId: number;

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

  @ApiProperty({
    example: 'admin',
    description: '사용자 권한',
  })
  @IsString()
  roleName: string;

  constructor(dto: SearchAccountResponseDto) {
    this.accountId = dto.accountId;
    this.username = dto.username;
    this.projectName = dto.projectName;
    this.roleName = dto.roleName;
    this.accountRoleId = dto.accountRoleId;
  }
}
