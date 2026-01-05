import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { StartConsultationCommand } from '@/application/dto/command';

export class StartConsultationRequest {
  @ApiProperty({
    description: '방문자 ID',
    example: 'visitor_123',
  })
  @IsString()
  @IsNotEmpty()
  visitorId: string;

  toCommand(): StartConsultationCommand {
    return {
      visitorId: this.visitorId,
    };
  }
}
