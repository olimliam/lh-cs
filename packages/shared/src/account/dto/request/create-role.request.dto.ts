import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateRoleRequestDto {
  @ApiProperty({
    example: 'admin',
    description: '사용자 권한',
  })
  @IsString()
  roleName!: string;
  @ApiProperty({
    example: true,
    description: '읽기 권한',
  })
  @IsBoolean()
  readable!: boolean;
  @ApiProperty({
    example: true,
    description: '쓰기 권한',
  })
  @IsBoolean()
  writable!: boolean;
  @ApiProperty({
    example: true,
    description: '수정 권한',
  })
  @IsBoolean()
  updatable!: boolean;
  @ApiProperty({
    example: true,
    description: '삭제 권한',
  })
  @IsBoolean()
  deletable!: boolean;
  @ApiProperty({
    example: true,
    description: '생성 권한',
  })
  @IsBoolean()
  creatable!: boolean;
  @ApiProperty({
    example: false,
    description: '권한 비활성화 상태',
  })
  @IsBoolean()
  isDeleted!: boolean;
}
