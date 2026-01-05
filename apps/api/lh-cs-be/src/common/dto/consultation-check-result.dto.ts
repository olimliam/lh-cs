import { UserRoleEnum } from '@/infrastructure/repository/entity';

export interface ConsultationStatusCheckResult {
  canJoin: boolean;
}

export interface RoomConnectionInfo {
  consultationId: string;
  connectedSockets: Map<
    string,
    {
      userId: string;
      userName: string;
      userType: UserRoleEnum;
      connectedAt: Date;
      socketId: string;
    }
  >;
}
