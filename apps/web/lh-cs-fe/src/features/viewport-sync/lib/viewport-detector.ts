import { ViewportData } from '../model/viewport-sync.types';
import {
  DeviceInfoMessage,
  UserRole,
} from '../../drawer/model/whiteboard.types';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';

export class ViewportDetector {
  private listeners: ((viewport: ViewportData) => void)[] = [];
  private lastViewport: ViewportData | null = null;
  private updateThrottle: number = 100; // 100ms 제한
  private resizeObserver?: ResizeObserver;

  constructor() {
    this.initializeDetection();
  }

  private async initializeDetection() {
    // ResizeObserver를 사용한 정밀한 크기 감지
    this.resizeObserver = new ResizeObserver((entries) => {
      console.log('📏 [ResizeObserver] Body element resized:', {
        entries: entries.map((entry) => ({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })),
        trigger: 'ResizeObserver',
      });
      this.handleViewportChange();
    });

    // body 요소 관찰
    this.resizeObserver.observe(document.body);
    console.log(
      '🎯 [ViewportDetector] Initialized - watching body element with ResizeObserver'
    );

    // window 크기 변경 감지
    window.addEventListener('resize', this.throttledViewportUpdate);
    window.addEventListener('orientationchange', this.handleOrientationChange);
    console.log(
      '👂 [ViewportDetector] Event listeners added for resize and orientationchange'
    );

    // 초기 뷰포트 감지
    await this.detectInitialViewport();
  }

  private async detectInitialViewport(): Promise<ViewportData> {
    const viewport: ViewportData = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation:
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      deviceType: this.detectDeviceType(),
      isTouchDevice: 'ontouchstart' in window,
      device: await this.gatherDeviceInformation(),
      timestamp: Date.now(),
      userId: '', // 런타임에 설정
      consultationCode: '', // 런타임에 설정
    };

    this.lastViewport = viewport;
    return viewport;
  }

  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const userAgent = navigator.userAgent;
    const width = window.innerWidth;

    // 모바일 키워드 체크
    const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPod'];
    const tabletKeywords = ['iPad', 'Tablet'];

    if (tabletKeywords.some((keyword) => userAgent.includes(keyword))) {
      return 'tablet';
    }

    if (mobileKeywords.some((keyword) => userAgent.includes(keyword))) {
      return 'mobile';
    }

    // 뷰포트 크기로 추가 판단
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    }

    return 'desktop';
  }

  // 상세 디바이스 정보 수집 (ViewportData용)
  private async gatherDeviceInformation(): Promise<ViewportData['device']> {
    // 기본 브라우저 정보
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;

    // 화면 정보
    const screen = {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
    };

    // 브라우저 파싱
    const browser = this.parseBrowserInfo(userAgent);

    // OS 파싱
    const os = this.parseOSInfo(userAgent, platform);

    // 터치 지원 감지
    const touchSupport =
      'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;

    // 네트워크 정보 (지원되는 경우)
    const network = await this.getNetworkInfo();

    // 배터리 정보 (지원되는 경우)
    const battery = await this.getBatteryInfo();

    return {
      userAgent,
      platform,
      language,
      screen,
      browser,
      os,
      touchSupport,
      network: network || undefined,
      battery: battery || undefined,
    };
  }

  // 브라우저 정보 파싱
  private parseBrowserInfo(userAgent: string) {
    let browser = { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };

    // Chrome
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      browser = {
        name: 'Chrome',
        version: match ? match[1] : 'Unknown',
        engine: 'Blink',
      };
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      browser = {
        name: 'Safari',
        version: match ? match[1] : 'Unknown',
        engine: 'WebKit',
      };
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      browser = {
        name: 'Firefox',
        version: match ? match[1] : 'Unknown',
        engine: 'Gecko',
      };
    }
    // Edge
    else if (userAgent.includes('Edg/')) {
      const match = userAgent.match(/Edg\/(\d+\.\d+)/);
      browser = {
        name: 'Edge',
        version: match ? match[1] : 'Unknown',
        engine: 'Blink',
      };
    }

    return browser;
  }

  // OS 정보 파싱
  private parseOSInfo(userAgent: string, platform: string) {
    let os: { name: string; version?: string } = { name: 'Unknown' };

    // Windows
    if (userAgent.includes('Windows NT')) {
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      os = {
        name: 'Windows',
        version: match ? match[1] : undefined,
      };
    }
    // macOS
    else if (userAgent.includes('Mac OS X')) {
      const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
      os = {
        name: 'macOS',
        version: match ? match[1].replace(/_/g, '.') : undefined,
      };
    }
    // iOS
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      const match = userAgent.match(/OS (\d+[._]\d+)/);
      os = {
        name: 'iOS',
        version: match ? match[1].replace(/_/g, '.') : undefined,
      };
    }
    // Android
    else if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android (\d+\.\d+)/);
      os = {
        name: 'Android',
        version: match ? match[1] : undefined,
      };
    }
    // Linux
    else if (platform.includes('Linux')) {
      os = { name: 'Linux' };
    }

    return os;
  }

  // 네트워크 정보 수집
  private async getNetworkInfo() {
    try {
      // Network Information API (지원되는 브라우저에서만)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        };
      }
    } catch (error) {
      console.warn('Network info not available:', error);
    }
    return null;
  }

  // 배터리 정보 수집
  private async getBatteryInfo() {
    try {
      // Battery Status API (일부 브라우저에서만 지원)
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging,
          chargingTime:
            battery.chargingTime !== Infinity
              ? battery.chargingTime
              : undefined,
          dischargingTime:
            battery.dischargingTime !== Infinity
              ? battery.dischargingTime
              : undefined,
        };
      }
    } catch (error) {
      console.warn('Battery info not available:', error);
    }
    return null;
  }

  private throttledViewportUpdate = this.throttle(() => {
    console.log('🔄 [Window Resize] Throttled resize event triggered');
    this.handleViewportChange();
  }, this.updateThrottle);

  private handleOrientationChange = () => {
    console.log(
      '📱 [Orientation] Device orientation changed, waiting 100ms...'
    );
    // orientationchange 이벤트 후 약간의 지연을 두고 감지
    setTimeout(() => {
      console.log('📱 [Orientation] Processing orientation change');
      this.handleViewportChange();
    }, 100);
  };

  private async handleViewportChange() {
    const newViewport = await this.detectInitialViewport();

    console.log('🔍 [ViewportDetector] Viewport change detected:', {
      trigger: 'resize/orientation change',
      newSize: { width: newViewport.width, height: newViewport.height },
      oldSize: this.lastViewport
        ? { width: this.lastViewport.width, height: this.lastViewport.height }
        : 'none',
      deviceType: newViewport.deviceType,
      orientation: newViewport.orientation,
    });

    this.notifyListeners(newViewport);
    this.lastViewport = newViewport;

    // 의미있는 변경사항만 감지 (5px 이상 차이)
    // if (this.hasSignificantChange(newViewport)) {
    //   console.log('✅ [ViewportDetector] Significant change detected, notifying listeners');
    //   this.notifyListeners(newViewport);
    //   this.lastViewport = newViewport;
    // } else {
    //   console.log('⏸️ [ViewportDetector] Change too small, ignoring');
    // }
  }

  // private hasSignificantChange(newViewport: ViewportData): boolean {
  //   if (!this.lastViewport) return true;

  //   const widthDiff = Math.abs(newViewport.width - this.lastViewport.width);
  //   const heightDiff = Math.abs(newViewport.height - this.lastViewport.height);

  //   return (
  //     widthDiff > 5 ||
  //     heightDiff > 5 ||
  //     newViewport.orientation !== this.lastViewport.orientation
  //   );
  // }

  private notifyListeners(viewport: ViewportData) {
    this.listeners.forEach((listener) => listener(viewport));
  }

  private throttle(func: any, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 외부 인터페이스
  public onViewportChange(callback: (viewport: ViewportData) => void) {
    this.listeners.push(callback);
  }

  public async getCurrentViewport(): Promise<ViewportData> {
    return this.lastViewport || (await this.detectInitialViewport());
  }

  // DeviceInfoMessage용 디바이스 정보 수집
  private async gatherDeviceInformationForMessage(): Promise<
    DeviceInfoMessage['data']['device']
  > {
    // 기본 브라우저 정보
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;

    // 화면 정보
    const screen = {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
    };

    // 뷰포트 정보
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      orientation: (window.innerWidth > window.innerHeight
        ? 'landscape'
        : 'portrait') as 'portrait' | 'landscape',
    };

    // 브라우저 파싱
    const browser = this.parseBrowserInfo(userAgent);

    // OS 파싱
    const os = this.parseOSInfo(userAgent, platform);

    // 디바이스 타입 감지
    const deviceType = this.detectDeviceType();

    // 터치 지원 감지
    const touchSupport =
      'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;

    // 네트워크 정보 (지원되는 경우)
    const network = await this.getNetworkInfo();

    // 배터리 정보 (지원되는 경우)
    const battery = await this.getBatteryInfo();

    return {
      userAgent,
      platform,
      language,
      screen,
      viewport,
      browser,
      os,
      deviceType,
      touchSupport,
      network: network || undefined,
      battery: battery || undefined,
    };
  }

  // 디바이스 정보 메시지 생성
  public async createDeviceInfoMessage(
    userId: string,
    userRole: UserRole,
    sessionId: string
  ): Promise<DeviceInfoMessage> {
    const device = await this.gatherDeviceInformationForMessage();
    const timestamp = Date.now();

    return {
      type: WsEmitEventsEnum.DEVICE_INFO,
      data: {
        userId,
        userRole,
        device,
        timestamp,
        sessionStartTime: timestamp,
      },
      sessionId,
      timestamp,
      userId,
    };
  }

  public destroy() {
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.throttledViewportUpdate);
    window.removeEventListener(
      'orientationchange',
      this.handleOrientationChange
    );
    this.listeners = [];
  }
}
