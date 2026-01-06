import { UserRoleEnum } from '@/shared/model/user-role.enum';
import type { ScreenSyncStep } from '@/features/screen-sync-guide';

export interface TourGNBWidgetProps {
  // WebSocket 연결 관련
  isWebSocketConnected?: boolean;
  onToggleConnection?: () => void;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'error';

  // 상담사 정보
  consultantName?: string;
  consultantAvatar?: string;
  consultantRole?: string;

  // 상담실 정보
  consultationCode?: string;
  roomName?: string;
  participantCount?: number;

  // 화면 동기화 버튼 활성화 여부
  isScreenSyncEnabled?: boolean;
  isScreenSyncLoading?: boolean;

  // 액션 핸들러
  onUserMenuClick?: (action: string) => void;
  onExitConsultation?: () => void;
  onReOffer?: () => void;
  onSyncConfirm?: () => void | Promise<void>;
  onSyncSkip?: () => void | Promise<void>;
  toggleConsultationInfo?: () => void;

  onOpenModal?: () => void;

  // 모드 구분
  userRole?: UserRoleEnum;
  mode?: 'guide' | 'view';

  // 화면 동기화 가이드 모달
  syncGuideSteps?: ScreenSyncStep[];
}

export interface WebSocketConnection {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnected?: Date;
  reconnectAttempts?: number;
}

export interface ConsultantProfile {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department?: string;
  isOnline: boolean;
}
