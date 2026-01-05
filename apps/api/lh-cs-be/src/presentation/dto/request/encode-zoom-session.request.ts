import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EncodeZoomSessionDto {
  @ApiProperty({
    description:
      'Zoom sessionId. `+`나 `/`를 포함하면 Zoom 요구사항에 따라 2중 인코딩합니다.',
    example: '1z7u2KlDQhegqZrGMkw1Sg==',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
