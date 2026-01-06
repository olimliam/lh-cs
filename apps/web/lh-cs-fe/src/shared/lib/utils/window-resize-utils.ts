/**
 * 브라우저 window 크기를 viewport에 맞춰 동적으로 조정하는 유틸리티 함수들
 */

export interface ResizeWindowOptions {
  /** 컨텐츠 영역의 너비 */
  contentWidth?: number;
  /** 컨텐츠 영역의 높이 */
  contentHeight: number;
  /** 주소창 높이 (기본값: 60px) */
  addressBarHeight?: number;
  /** 화면공유 팝업 높이 (기본값: 40px) */
  screenSharePopupHeight?: number;
  /** 기타 브라우저 UI 높이 (기본값: 20px) */
  browserChromeHeight?: number;
  /** 최소 너비 (기본값: 412px) */
  minWidth?: number;
  /** 최소 높이 (기본값: 700px) */
  minHeight?: number;
  /** 화면 여유 공간 (기본값: 50px) */
  screenMargin?: number;
}

/**
 * 고객의 viewport 크기에 맞춰 호스트 window를 resize하는 함수
 * @param options 리사이즈 옵션
 */
export const resizeWindowToViewport = (options: ResizeWindowOptions): void => {
  const {
    contentWidth = 412, // iPhone 14 Pro 기준 기본 너비
    contentHeight,
    addressBarHeight = 60,
    screenSharePopupHeight = 40,
    browserChromeHeight = 20,
    minWidth = 412,
    minHeight = 700,
    screenMargin = 50,
  } = options;

  try {
    // 총 높이 = 컨텐츠 높이 + 브라우저 UI 높이들
    const totalHeight =
      contentHeight +
      addressBarHeight +
      screenSharePopupHeight +
      browserChromeHeight;

    // 최소/최대 크기 제한
    const finalWidth = Math.max(contentWidth, minWidth);
    const maxHeight = Math.min(
      totalHeight,
      window.screen.availHeight - screenMargin
    );
    const finalHeight = Math.max(maxHeight, minHeight);

    // window 크기 조정
    window.resizeTo(finalWidth, finalHeight);
  } catch (error) {
    console.warn('❌ Failed to resize window:', error);
  }
};

/**
 * 모바일 디바이스 크기로 window를 resize하는 함수
 * @param contentHeight 컨텐츠 높이
 */
export const resizeWindowToMobile = (contentHeight: number): void => {
  resizeWindowToViewport({ contentHeight });
};

/**
 * viewport 데이터를 기반으로 window를 resize하는 함수
 * @param viewport viewport 정보 객체
 */
export const resizeWindowToViewportData = (viewport: {
  width?: number;
  height?: number;
}, overrides?: Partial<ResizeWindowOptions>): void => {
  if (!viewport.height) {
    console.warn('⚠️ Viewport height is required for window resize');
    return;
  }

  resizeWindowToViewport({
    contentWidth: viewport.width,
    contentHeight: viewport.height,
    ...overrides,
  });
};
