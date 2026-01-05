import { ConsultationStatusEnum } from '@/shared';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { TourMarkerType, TravelerMarkerContent } from '@packages/traveler';

export enum DRAW_TYPE {
  START = 'start',
  DRAW = 'draw',
  STOP = 'stop',
  CLEAR = 'clear',
  UNDO = 'undo',
  REDO = 'redo',
  SLIDE_LIST = 'slideList',
  IMAGE_UPDATE = 'imageUpdate',
}

// 사용자 역할 정의
export type UserRole = UserRoleEnum;

export interface Position {
  x: number;
  y: number;
}

export enum PEN_COLOR {
  BLACK = 'black',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
  WHITE = 'white',
}

export enum PEN_WIDTH {
  LIGHT = 1,
  NORMAL = 2,
  BOLD = 4,
}

export enum LINE_STYLE {
  DASHED = 'dashed',
  SOLID = 'solid',
  LINE = 'line',
}

export interface CanvasToolOptions {
  penColor: PEN_COLOR;
  penWidth: PEN_WIDTH;
  isEraseMode: boolean;
  lineStyle: LINE_STYLE;
  previousLineStyle?: LINE_STYLE; // 지우개 모드 전 선택된 라인 스타일 저장
}

export interface Slide {
  id: string;
  isSelected: boolean;
  drawInfo?: DrawInfo;
  image?: string;
  thumbnail?: string;
  drawStack?: DrawInfo[][];
  redoStack?: DrawInfo[][];
}

export interface DrawInfo {
  type: DRAW_TYPE;
  position: Position;
  options: CanvasToolOptions;
}

export interface ImageUpdateMessage {
  type: DRAW_TYPE.IMAGE_UPDATE;
  slideId: string;
  imageUrl?: string;
  imageData?: string; // base64 for small images
}

export interface SlideListMessage {
  type: DRAW_TYPE.SLIDE_LIST;
  data: any[];
}

// Tour 메시지 인터페이스들
export interface SceneChangeMessage {
  type: WsEmitEventsEnum.SCENE_CHANGE;
  data: {
    sceneId: number;
    sceneName?: string;
    title?: string;
    description?: string;
    position?: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number };
    timestamp: number;
    userId: string;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

export interface ViewSyncMessage {
  type: WsEmitEventsEnum.VIEW_SYNC;
  data: {
    sceneId?: number;
    isDrawingMode: boolean;
    timestamp: number;
    userId: string;
    userRole: UserRole;
    camera?: {
      position: { x: number; y: number; z: number };
      rotation: { pitch: number; yaw: number };
      fov: number;
    };
    viewport?: {
      width: number;
      height: number;
    };
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

export interface UserPresenceMessage {
  type: WsEmitEventsEnum.USER_PRESENCE;
  data: {
    userId: string;
    userName?: string;
    userRole: UserRole;
    isConnected: boolean;
    timestamp: number;
    sessionId: string;
    currentScene?: number;
    cursor?: { x: number; y: number };
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

export interface ViewportSyncMessage {
  type: WsEmitEventsEnum.VIEWPORT_SYNC;
  data: {
    sceneId?: number;
    userId: string;
    userRole: UserRole;
    viewport: {
      width: number; // window.innerWidth
      height: number; // window.innerHeight
      aspectRatio: number; // window.innerWidth / window.innerHeight
      devicePixelRatio: number;
      orientation?: 'portrait' | 'landscape';
    };
    // 상세한 디바이스 정보 (선택적) - ViewportData의 device 타입과 일치
    device?: {
      userAgent: string;
      platform: string;
      language: string;
      screen: {
        width: number;
        height: number;
        availWidth: number;
        availHeight: number;
        colorDepth: number;
        pixelDepth: number;
      };
      browser: {
        name: string;
        version: string;
        engine: string;
      };
      os: {
        name: string;
        version?: string;
      };
      touchSupport: boolean;
      network?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
      };
      battery?: {
        level: number;
        charging: boolean;
        chargingTime?: number;
        dischargingTime?: number;
      };
    };
    timestamp: number;
    isMaster?: boolean;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

export interface DeviceInfoMessage {
  type: WsEmitEventsEnum.DEVICE_INFO;
  data: {
    userId: string;
    userRole: UserRole;
    device: {
      userAgent: string;
      platform: string;
      language: string;
      screen: {
        width: number;
        height: number;
        availWidth: number;
        availHeight: number;
        colorDepth: number;
        pixelDepth: number;
      };
      viewport: {
        width: number;
        height: number;
        devicePixelRatio: number;
        orientation: 'portrait' | 'landscape';
      };
      browser: {
        name: string;
        version: string;
        engine: string;
      };
      os: {
        name: string;
        version?: string;
      };
      deviceType: 'desktop' | 'tablet' | 'mobile';
      touchSupport: boolean;
      network?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
      };
      battery?: {
        level: number;
        charging: boolean;
        chargingTime?: number;
        dischargingTime?: number;
      };
    };
    timestamp: number;
    sessionStartTime: number;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

export interface PointerMoveMessage {
  type: WsEmitEventsEnum.POINTER_MOVE;
  data: {
    consultationId: string;
    userType: string;
    userRole?: string;
    userId: string;
    context: '2d' | '3d';
    pointer: { x: number; y: number };
    viewport?: { width: number; height: number; aspectRatio: number };
    meta?: { sceneId?: string; cameraId?: string };
    action?: 'move' | 'click';
  };
  sessionId: string;
  timestamp: number;
  userId?: string;
}

export interface MarkerClickMessage {
  type: WsEmitEventsEnum.MARKER_CLICK;
  data: {
    markerId: number;
    markerType?: TourMarkerType;
    markerContent?: TravelerMarkerContent;
    userId: string;
    userRole: UserRole;
    timestamp: number;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

export interface RemotePopupClosedMessage {
  type: WsEmitEventsEnum.REMOTE_POPUP_CLOSED;
  data: {
    markerId: number | string;
    markerType?: TourMarkerType;
    markerContent?: TravelerMarkerContent;
    userId: string;
    userRole: UserRole;
    timestamp: number;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

// 카메라 회전 동기화 메시지
export interface CameraRotationMessage {
  type: WsEmitEventsEnum.CAMERA_ROTATION;
  data: {
    sceneId?: number;
    pitch: number;
    yaw: number;
    roll: number;
    userId: string;
    userRole: UserRole;
    timestamp: number;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

// 카메라 FOV 동기화 메시지
export interface CameraFovMessage {
  type: WsEmitEventsEnum.CAMERA_FOV;
  data: {
    sceneId: number;
    sceneName?: string;
    title?: string;
    fov: number;
    userId: string;
    userRole: UserRole;
    timestamp: number;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

// 상담실 상태 업데이트 메시지
export interface ConsultationStatusUpdateMessage {
  type: WsEmitEventsEnum.CONSULTATION_STATUS_UPDATE;
  data: {
    consultationId: string;
    visitorId?: string;
    status: ConsultationStatusEnum;
    connectedUsers: {
      admin: boolean;
      visitor: boolean;
    };
    consultingStartedAt?: string; // 상담 시작 시간
    timestamp: number;
  };
  sessionId: string;
  timestamp: number;
  userId: string;
}

// 상담실 종료 알림 메시지
export interface ConsultationEndingMessage {
  type: WsEmitEventsEnum.CONSULTATION_ENDING;
  data: {
    consultationId: string;
    message: string;
    timestamp: string;
  };
}

export type TourMessage =
  | SceneChangeMessage
  | ViewSyncMessage
  | UserPresenceMessage
  | ViewportSyncMessage
  | DeviceInfoMessage
  | CameraRotationMessage
  | CameraFovMessage
  | PointerMoveMessage
  | MarkerClickMessage
  | RemotePopupClosedMessage
  | ConsultationStatusUpdateMessage
  | ConsultationEndingMessage;

export type PublishMessage =
  | SlideListMessage
  | ImageUpdateMessage
  | TourMessage;
