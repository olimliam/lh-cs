import { ConsultationStatusEnum } from '@/shared';
import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';

export interface CreateConsultationRequest {
  tourId: string;
  startTourFacilityId: string;
  roomName?: string;
  capacity?: number;
  enterCode?: string; // 4자리 입장 코드
  consultationCode: string; // 상담 코드
}

export interface CreateConsultationResponse {
  id: string;
  roomNumber: string;
  roomName?: string;
  consultationCode: string;
  squareMeters: number;
  enterCode?: string;
  status: ConsultationStatusEnum;
  isActive: boolean;
  consultantName: string;
  tourCdnId: string;
  tourTitle: string;
  tourImageUrl?: string;
  facilityTitle: string;
  startFacilitySceneId: string;
  startTourFacilityId?: string;
  visitorId?: string;
  consultingStartedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsultationRoom = CreateConsultationResponse & {
  // 실시간 연결 상태 정보 (WebSocket으로 업데이트)
  connectedUsers?: {
    admin: boolean;
    visitor: boolean;
  };
  // 상담 시작 시간 (CONSULTING 상태가 된 시점)
  consultingStartedAt?: string | Date;
  // 상담 종료 요청 시간 (END 상태로 변경된 시점)
  endRequestedAt?: string | Date;
};

// 상담실 목록 컴포넌트 관련 타입들
export interface ConsultationListProps extends ConsultationActions {
  consultationRooms: ConsultationRoom[];
}

export interface ConsultationCardProps extends ConsultationActions {
  room: ConsultationRoom;
}

export interface ConsultationDisplayData {
  id: string;
  roomNumber: string;
  consultationCode: string;
  status: ConsultationStatusEnum;
  tourTitle: string;
  facilityTitle: string;
  startFacilitySceneId: string;
  startTourFacilityId?: string;
  consultantName: string;
  thumbnailUrl?: string;
  createdTime?: string;
  elapsedTime?: string;
}

export interface ConsultationActions {
  onEnterRoom: (
    roomId: string,
    tourCdnId: string,
    startFacilitySceneId?: string
  ) => void;
  onEndRoom: (roomId: string) => void;
  onCopyInfo: (room: ConsultationRoom) => void;
  onTimerDone: (roomId: string) => void;
}

export interface TourDataByFullInfo {
  id: string;
  tourCdnId: string;
  squareMeters: number;
  title: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ConsultationFullInfoResponse
  extends CreateConsultationResponse {
  userId: string;
  tour: TourDataByFullInfo;
  tourFacilities: TourFacilityResponse[];
}
