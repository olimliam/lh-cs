export interface ViewportData {
  // 기본 화면 정보
  width: number;
  height: number;
  aspectRatio: number;
  
  // 디바이스 정보
  devicePixelRatio: number;
  orientation: 'landscape' | 'portrait';
  
  // 브라우저 정보
  viewportWidth: number;    // 실제 뷰포트 너비
  viewportHeight: number;   // 실제 뷰포트 높이
  scrollX: number;
  scrollY: number;
  
  // 디바이스 타입 감지
  deviceType: 'desktop' | 'tablet' | 'mobile';
  isTouchDevice: boolean;
  
  // 상세 디바이스 정보 (선택적)
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
  
  // 메타 정보
  timestamp: number;
  userId: string;
  consultationCode: string;
}

export interface ViewportSyncPayload {
  viewport: ViewportData;
  syncMode: 'initial' | 'update' | 'resize';
  reason?: string;
}

export interface ViewportSyncState {
  currentViewport: ViewportData | null;
  isUserConnected: boolean;
  adminSyncEnabled: boolean;
  lastSyncTime: number;
}

export interface ViewportSyncActions {
  updateViewport: (viewport: ViewportData) => void;
  setUserConnected: (connected: boolean) => void;
  toggleAdminSync: () => void;
  setAdminSync: (enabled: boolean) => void;
  clearViewport: () => void;
}