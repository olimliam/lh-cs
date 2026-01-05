import { ConsultationStatusEnum } from '@/shared';

export interface ConsultationInfo {
  consultationCode: string;
  roomName?: string;
  consultantName?: string;
  tourTitle?: string;
  facilityTitle?: string;
  status: ConsultationStatusEnum;
  joinedAt?: Date;
  participantCount?: number;
}

export interface ConsultationInfoState {
  info: ConsultationInfo | null;
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ConsultationInfoActions {
  setInfo: (info: ConsultationInfo) => void;
  updateStatus: (status: ConsultationStatusEnum) => void;
  toggleVisibility: () => void;
  clearInfo: () => void;
}
