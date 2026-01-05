import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EndZoomSessionDto {
  @ApiPropertyOptional({
    description:
      'Zoom sessionId. `+`나 `/`를 포함하는 ID는 서버가 Zoom 요구사항에 맞게 2중 인코딩합니다.',
    example: 'cc2i1PmPS3atMXA+RB8rQw==',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
