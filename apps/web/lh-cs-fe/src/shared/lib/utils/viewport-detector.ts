export interface ViewportInfo {
  width: number;
  height: number;
  aspectRatio: number;
  devicePixelRatio: number;
}

export class ViewportDetector {
  private resizeObserver: ResizeObserver | null = null;
  private callbacks: ((viewport: ViewportInfo) => void)[] = [];

  constructor() {
    this.initializeResizeObserver();
  }

  private initializeResizeObserver(): void {
    if (typeof window === 'undefined' || !window.ResizeObserver) {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        this.notifyCallbacks(this.createViewportInfo(width, height));
      }
    });
  }

  public observe(element: HTMLElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
  }

  public unobserve(element: HTMLElement): void {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(element);
    }
  }

  public disconnect(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.callbacks = [];
  }

  public onViewportChange(callback: (viewport: ViewportInfo) => void): () => void {
    this.callbacks.push(callback);
    
    // 현재 뷰포트 정보를 즉시 콜백에 전달
    const currentViewport = this.getCurrentViewport();
    callback(currentViewport);
    
    // unsubscribe 함수 반환
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public getCurrentViewport(): ViewportInfo {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0, aspectRatio: 0, devicePixelRatio: 1 };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    return this.createViewportInfo(width, height);
  }

  private createViewportInfo(width: number, height: number): ViewportInfo {
    return {
      width,
      height,
      aspectRatio: width / height,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  }

  private notifyCallbacks(viewport: ViewportInfo): void {
    this.callbacks.forEach(callback => callback(viewport));
  }
}

export const viewportDetector = new ViewportDetector();