import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export enum RESPONSE_STATUS {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

const STATUS_MESSAGES = {
  [RESPONSE_STATUS.SUCCESS]: '이메일이 성공적으로 발송되었습니다.',
  [RESPONSE_STATUS.FAIL]: '이메일 발송에 실패했습니다.',
};

export class SendEmailBySesResponseDto {
  @ApiProperty({
    example: 'SUCCESS',
    description: '이메일 발송 상태',
    enum: RESPONSE_STATUS,
  })
  @IsEnum(RESPONSE_STATUS)
  status: RESPONSE_STATUS;

  @ApiProperty({
    example: '이메일이 성공적으로 발송되었습니다.',
    description: '상태 메시지',
  })
  @IsString()
  message: string;

  constructor(status: RESPONSE_STATUS) {
    this.status = status;
    this.message = STATUS_MESSAGES[status];
  }
}
