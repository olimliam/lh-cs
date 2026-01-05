import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartConsultationCommand {
  @ApiProperty({
    description: '방문자 ID',
    example: 'visitor_123',
  })
  @IsString()
  @IsNotEmpty()
  visitorId: string;
}
