import { StateStorage } from 'zustand/middleware';
import { SlideItemDto } from '../model/slide-item.dto';

/**
 * Zustand를 위한 localStorage 저장소
 */
const localStorageApi: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Failed to set item to localStorage:', error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },
};

/**
 * 세션 기반 저장소 (새로고침 시에만 유지, 탭 종료 시 삭제)
 */
const sessionStorageApi: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return sessionStorage.getItem(name);
    } catch (error) {
      console.error('Failed to get item from sessionStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      sessionStorage.setItem(name, value);
    } catch (error) {
      console.error('Failed to set item to sessionStorage:', error);
    }
  },
  removeItem: (name: string): void => {
    try {
      sessionStorage.removeItem(name);
    } catch (error) {
      console.error('Failed to remove item from sessionStorage:', error);
    }
  },
};

/**
 * 슬라이드 데이터 저장/복원을 위한 유틸리티
 */
export const slideDataPersistence = {
  // 세션별 슬라이드 데이터 저장
  saveSlideData: (sessionId: string, slideList: SlideItemDto[]): void => {
    try {
      const data = {
        sessionId,
        slideList,
        timestamp: new Date().toISOString(),
      };
      sessionStorageApi.setItem(
        `whiteboard_${sessionId}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Failed to save slide data:', error);
    }
  },

  // 세션별 슬라이드 데이터 복원
  loadSlideData: (sessionId: string): SlideItemDto[] | null => {
    try {
      const stored = sessionStorageApi.getItem(`whiteboard_${sessionId}`) as
        | string
        | null;
      if (!stored) return null;

      const data = JSON.parse(stored);
      if (data.sessionId === sessionId && data.slideList) {
        return data.slideList.map((slide: any) => new SlideItemDto(slide));
      }
      return null;
    } catch (error) {
      console.error('Failed to load slide data:', error);
      return null;
    }
  },

  // 세션 데이터 삭제
  clearSlideData: (sessionId: string): void => {
    try {
      sessionStorageApi.removeItem(`whiteboard_${sessionId}`);
    } catch (error) {
      console.error('Failed to clear slide data:', error);
    }
  },

  // 현재 세션 ID 생성/가져오기
  getOrCreateSessionId: (): string => {
    const stored = sessionStorageApi.getItem('whiteboard_session_id') as
      | string
      | null;
    if (stored) return stored;

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorageApi.setItem('whiteboard_session_id', newSessionId);
    return newSessionId;
  },
};

export { localStorageApi, sessionStorageApi };
