import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { launchVisionAiWindow } from '@/features/vision-ai/lib/launch-vision-ai-window';
import {
  SectionTitle as SharedSectionTitle,
  MenuItemText as SharedMenuItemText,
} from '@/shared/ui';
import type { LNBMenuItem } from '../model';
import {
  ArrowIcon,
  IconWrapper,
  MenuItem,
  MenuItemContent,
  MenuList,
  MenuSection,
  SectionTitle,
} from '../style/lnb-style';

interface UseMenuSectionParams {
  /** 개발 중인 메뉴 ID 목록 (개발 진행 중 토스트를 표시할 메뉴들) */
  developmentMenuIds?: string[];
  /** 커스텀 메뉴 클릭 핸들러 (특별한 처리가 필요한 경우) */
  onCustomMenuClick?: (item: LNBMenuItem) => void;
}

/**
 * 에러 메시지를 안전하게 추출하는 헬퍼 함수
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '비전 AI 창을 여는 동안 알 수 없는 오류가 발생했습니다.';
};

export const useMenuSection = (params: UseMenuSectionParams = {}) => {
  const { developmentMenuIds = ['consultation-history'], onCustomMenuClick } = params;
  
  const location = useLocation();
  const navigate = useNavigate();
  const toastMessages = useToastMessages();
  const [isVisionAiLaunching, setIsVisionAiLaunching] = useState(false);

  /**
   * 현재 경로와 메뉴 path가 활성 상태인지 확인
   */
  const isActive = useCallback((path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  /**
   * 비전 AI 메뉴 클릭 핸들러
   */
  const handleVisionAiMenuClick = useCallback(async () => {
    if (isVisionAiLaunching) {
      return;
    }

    setIsVisionAiLaunching(true);
    toastMessages.showInfo('비전 AI 분석 결과 창을 준비 중입니다.');

    try {
      const { url } = await launchVisionAiWindow();
      toastMessages.showSuccess(
        `비전 AI 분석 결과 창을 새 창에서 열었습니다.\n${url}`
      );
    } catch (error) {
      toastMessages.showError(getErrorMessage(error));
    } finally {
      setIsVisionAiLaunching(false);
    }
  }, [isVisionAiLaunching, toastMessages]);

  /**
   * 메뉴 클릭 핸들러
   */
  const handleMenuClick = useCallback((item: LNBMenuItem) => {
    // 커스텀 핸들러가 있으면 우선 실행
    if (onCustomMenuClick) {
      onCustomMenuClick(item);
      return;
    }

    // 개발 중인 메뉴인 경우 토스트 표시
    if (developmentMenuIds.includes(item.id)) {
      toastMessages.showDevelopmentInProgress();
      return;
    }

    // 비전 AI 메뉴인 경우 특별 처리
    if (item.id === 'vision-ai-analysis') {
      void handleVisionAiMenuClick();
      return;
    }

    // 일반적인 네비게이션
    navigate(item.path);
  }, [navigate, toastMessages, developmentMenuIds, onCustomMenuClick, handleVisionAiMenuClick]);

  /**
   * 메뉴 섹션 렌더링 함수
   */
  const renderMenuSection = useCallback((
    title: string,
    items: LNBMenuItem[],
    icon: React.ReactNode,
    sectionId?: string
  ) => (
    <MenuSection key={sectionId || title}>
      <SectionTitle>
        <IconWrapper>{icon}</IconWrapper>
        <SharedSectionTitle>{title}</SharedSectionTitle>
      </SectionTitle>
      <MenuList>
        {items.map((item) => {
          const isSelected = isActive(item.path);
          
          return (
            <MenuItem
              key={item.id}
              isSelected={isSelected}
              onClick={() => handleMenuClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMenuClick(item);
                }
              }}
              aria-label={`${item.label} 메뉴로 이동`}
            >
              <MenuItemContent>
                <SharedMenuItemText isSelected={isSelected}>
                  {item.label}
                </SharedMenuItemText>
                <ArrowIcon isSelected={isSelected} />
              </MenuItemContent>
            </MenuItem>
          );
        })}
      </MenuList>
    </MenuSection>
  ), [isActive, handleMenuClick]);

  /**
   * 여러 메뉴 섹션을 한 번에 렌더링하는 함수
   */
  const renderMenuSections = useCallback((
    sections: Array<{
      title: string;
      items: LNBMenuItem[];
      icon: React.ReactNode;
      id?: string;
    }>
  ) => {
    return sections.map((section) => 
      renderMenuSection(section.title, section.items, section.icon, section.id)
    );
  }, [renderMenuSection]);

  return {
    renderMenuSection,
    renderMenuSections,
    isActive,
    handleMenuClick,
    handleVisionAiMenuClick,
    isVisionAiLaunching,
  };
};