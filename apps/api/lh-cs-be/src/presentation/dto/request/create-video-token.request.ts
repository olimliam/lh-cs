import { IsEnum, IsString } from 'class-validator';
import { ZoomRole } from '@/application/zoom/zoom-video-role.enum';

export class CreateVideoTokenRequestDto {
  @IsString()
  consultationId!: string;

  @IsEnum(ZoomRole)
  role!: ZoomRole;

  @IsString()
  userId!: string;

  @IsString()
  userName!: string;
}

export { ZoomRole };
