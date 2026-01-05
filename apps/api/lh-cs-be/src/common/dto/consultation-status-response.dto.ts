import {
  ConsultationStatus,
  UserRoleEnum,
} from '@/infrastructure/repository/entity';

export interface ConnectedUser {
  userId: string;
  userType: UserRoleEnum;
  connectedAt: Date;
  socketId: string;
  lastSeenAt?: Date; // 마지막으로 확인된 시간
  disconnectedAt?: Date; // 연결 해제된 시간
  isTemporaryDisconnect?: boolean; // 일시적 연결 해제 여부
}

export interface ConsultationInfo {
  id: string;
  status: ConsultationStatus;
  roomNumber: string;
  consultantName: string;
  visitorId?: string;
  isVisitorConnected: boolean;
  isManagerConnected: boolean;
}

export class ConsultationStatusResponseDto {
  success: boolean;
  canJoin: boolean;
  consultation?: ConsultationInfo;
  connectedUsers?: {
    managers: ConnectedUser[];
    visitors: ConnectedUser[];
  };
  reason?:
    | 'ADMIN_ALREADY_CONNECTED'
    | 'CONSULTATION_NOT_FOUND'
    | 'CONSULTATION_ENDED'
    | 'ACCESS_DENIED';
  message?: string;
  timestamp: number;

  constructor(data: Partial<ConsultationStatusResponseDto>) {
    Object.assign(this, data);
    this.timestamp = Date.now();
  }

  static success(data: {
    canJoin: boolean;
    consultation?: ConsultationInfo;
    connectedUsers?: {
      managers: ConnectedUser[];
      visitors: ConnectedUser[];
    };
    message?: string;
  }): ConsultationStatusResponseDto {
    return new ConsultationStatusResponseDto({
      success: true,
      ...data,
    });
  }

  static error(reason: string, message: string): ConsultationStatusResponseDto {
    return new ConsultationStatusResponseDto({
      success: false,
      canJoin: false,
      reason: reason as any,
      message,
    });
  }
}
