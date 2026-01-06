import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendEmailBySesRequestDto {
  @ApiProperty({
    example: false,
    description: '이메일',
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: false,
    description: '제목',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    example: false,
    description: '내용',
  })
  @IsString()
  mailBody!: string;
}
