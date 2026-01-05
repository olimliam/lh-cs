import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class ConsultationStatusCheckDto {
  @IsString()
  @IsNotEmpty()
  consultationId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(UserRoleEnum)
  userType: UserRoleEnum;
}

export interface ConsultationStatusCheckPayload
  extends ConsultationStatusCheckDto {
  socketId?: string;
  userName?: string;
}
