import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterAccountDto {
  @ApiProperty({
    example: 'tester',
    description: '사용자 ID',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'test1234',
    description: '사용자 비밀번호',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'elypecs',
    description: '등록된 서비스 명',
  })
  @IsString()
  projectName: string;

  @ApiProperty({
    example: 'admin',
    description: '부여된 사용자 권한',
  })
  @IsString()
  roleName: string;

  constructor(dto: RegisterAccountDto) {
    this.username = dto.username;
    this.password = dto.password;
    this.projectName = dto.projectName;
    this.roleName = dto.roleName;
  }
}
