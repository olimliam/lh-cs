import styled from '@emotion/styled';
import { IconButton } from '@mui/material';
import React, { useState } from 'react';

import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { BASE_FONT_FAMILY, BrushIcon, ConsultationEndModal } from '@/shared/ui';
// import { SettingsIcon } from '@/shared/ui/icons/settings-icon';
import type { TourNavigationProps } from '../model/tour-navigation.types';

import { endConsultation } from '@/features/consultation/api/consultation-command-api';
import { useTimer } from '@/shared/hooks/use-timer';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { ClockIcon } from '@/shared/ui/icons/clock-icon';
import { ExitIcon } from '@/shared/ui/icons/exit-icon';
import { PointIcon } from '@/shared/ui/icons/point-icon';
import { PositionControls } from './position-controls';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';

// Styled components matching the toolbar design
const NavigationContainer = styled.div<{ isShow?: boolean }>`
  position: fixed;
  bottom: 58px;
  left: 50%;
  transform: translateX(-50%)
    translateY(${({ isShow }) => (isShow ? '0' : '30px')});
  z-index: 1200;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: space-between;

  min-width: 300px;
  height: 60px;

  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255);

  transition:
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  opacity: ${({ isShow }) => (isShow ? 1 : 0)};

  visibility: ${({ isShow }) => (isShow ? 'visible' : 'hidden')};

  @media (max-width: 1024px) {
    max-width: 360px;
  }
  /* @media (max-width: 768px) {
    bottom: 16px;
    min-width: 280px;
    padding: 6px 12px;
    gap: 12px;
  } */
`;

const ToolButton = styled(IconButton)`
  color: #333;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);

  &.MuiIconButton-root {
    width: 32px;
    height: 32px;

    background: #fff;

    .MuiSvgIcon-root {
      font-size: 16px;
    }
  }
`;

const BrushIconButton = styled(ToolButton)`
  &.MuiIconButton-root {
    border: 1px solid #eee;
  }
`;

const StatusText = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-weight: 500;
  line-height: 130%; /* 20.8px */
  color: #333;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 4px;

  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);

  @media (max-width: 1024px) {
    padding: 8px 14px;
  }
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  &.drawing-tool-section {
    width: 60px;
    height: 100%;
    justify-content: center;
    background-color: #fff;
    & .MuiIconButton-root {
      width: 44px;
      height: 44px;

      background: #fff;

      .MuiSvgIcon-root {
        font-size: 16px;
      }
    }
  }

  @media (max-width: 1024px) {
    gap: 6px;
  }
`;

const ControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  width: calc(100% - 60px);
  gap: 8px;
`;

export const TourNavigationControls: React.FC<TourNavigationProps> = ({
  userRole,
  consultationId,
  userId,
  className,
  isDrawingMode,
  runningTime,
  isShow = false,
  tourId,
  options,
  toggleDrawMode,
  onEmitMessage,
  onClickLocation,
  // isCameraEditMode = false,
  // onToggleCameraEditMode,
  currentSceneId,
  onToggleShowPositionControls,
  showPositionControls,
}) => {
  const { isTablet } = useDeviceDetector();
  // const [showPositionControls, setShowPositionControls] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Default options 설정
  const defaultOptions = {
    drawingTool: { show: true, disabled: false },
    operationTime: { show: true, label: '운영 시간' },
    locationControl: { show: true, disabled: false },
    cameraSettings: { show: true, disabled: false },
    exitButton: { show: true, disabled: false, confirmBeforeExit: false },
  };

  const mergedOptions = {
    drawingTool: { ...defaultOptions.drawingTool, ...options?.drawingTool },
    operationTime: {
      ...defaultOptions.operationTime,
      ...options?.operationTime,
    },
    locationControl: {
      ...defaultOptions.locationControl,
      ...options?.locationControl,
    },
    cameraSettings: {
      ...defaultOptions.cameraSettings,
      ...options?.cameraSettings,
    },
    exitButton: { ...defaultOptions.exitButton, ...options?.exitButton },
  };

  const handleDrawingModeToggle = () => {
    if (mergedOptions.drawingTool.disabled) return;
    const newMode = !isDrawingMode;

    toggleDrawMode(newMode);
  };

  // 운영 시간 실시간 카운터
  const { formattedTime: operationTime } = useTimer({
    startTime: runningTime,
  });

  // if (isDrawingMode || userRole !== UserRoleEnum.ADMIN) return null;

  const handleCloseWindow = async () => {
    if (mergedOptions.exitButton.disabled) return;

    // if (mergedOptions.exitButton.confirmBeforeExit) {
    //   const confirmed = window.confirm('정말로 나가시겠습니까?');
    //   if (!confirmed) return;
    // }

    if (consultationId) {
      try {
        // 1. 상담 종료 웹소켓 메시지 전송
        if (onEmitMessage && userId) {
          const disconnectionMessage = JSON.stringify({
            type: WsEmitEventsEnum.CONSULTATION_STATUS_UPDATE,
            data: {
              consultationId,
              userType: userRole === UserRoleEnum.ADMIN ? 'admin' : 'user',
              connected: false,
            },
            timestamp: new Date().toISOString(),
            userId: userId,
            sessionId: consultationId,
          });
          onEmitMessage('lh-live-chat', disconnectionMessage);
          console.log('Disconnection message sent');
        }

        // 2. 상담 종료 API 호출 (ADMIN인 경우에만)
        if (userRole === UserRoleEnum.ADMIN) {
          await endConsultation(consultationId);
        }

        // 3. 종료 후 창 닫기
        window.close();
      } catch (error) {
        console.error('상담실 종료 실패:', error);
        // 에러가 발생해도 창은 닫기
        window.close();
      }
    } else {
      // consultationId가 없으면 그냥 창 닫기
      window.close();
    }
  };

  const handleOpenFacilitiesList = () => {
    console.log('open facilities list');
    if (mergedOptions.locationControl.disabled) return;
    if (
      onToggleShowPositionControls &&
      typeof onToggleShowPositionControls === 'function'
    ) {
      onToggleShowPositionControls();
    }
    // setShowPositionControls(!showPositionControls);
  };

  // const handleClosePositionControls = () => {
  //   setShowPositionControls(false);
  // };

  // const handleToggleCameraEditMode = () => {
  //   if (mergedOptions.cameraSettings.disabled) return;
  //   if (onToggleCameraEditMode) {
  //     onToggleCameraEditMode();
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener('beforeunload', function (e) {
  //     e.preventDefault();
  //   });
  // }, []);

  return (
    <>
      <NavigationContainer className={className} isShow={isShow}>
        {/* 왼쪽: 그리기 도구 */}
        {mergedOptions.drawingTool.show && (
          <ToolbarSection className='drawing-tool-section'>
            <BrushIconButton
              onClick={handleDrawingModeToggle}
              aria-label='drawing-mode'
              disabled={mergedOptions.drawingTool.disabled}
              style={{
                opacity: mergedOptions.drawingTool.disabled ? 0.5 : 1,
                cursor: mergedOptions.drawingTool.disabled
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              <BrushIcon width={20} height={20} color={'#333'} />
            </BrushIconButton>
          </ToolbarSection>
        )}

        <ControlsWrapper>
          {/* 중앙: 운영 시간 */}
          {mergedOptions.operationTime.show && (
            <StatusText>
              {!isTablet && (
                <>
                  <div className='flex justify-center'>
                    <ClockIcon width={20} height={20} />
                  </div>
                  {mergedOptions.operationTime.label}:{' '}
                </>
              )}

              <span className='font-bold'>{operationTime}</span>
            </StatusText>
          )}

          {/* 오른쪽: 위치 및 설정 */}
          <ToolbarSection>
            {mergedOptions.locationControl.show && (
              <ToolButton
                onClick={handleOpenFacilitiesList}
                aria-label='location'
                disabled={mergedOptions.locationControl.disabled}
                style={{
                  opacity: mergedOptions.locationControl.disabled ? 0.5 : 1,
                  cursor: mergedOptions.locationControl.disabled
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                <PointIcon width={11.591} height={14.75} />
              </ToolButton>
            )}
            {/* {mergedOptions.cameraSettings.show && (
              <ToolButton
                onClick={handleToggleCameraEditMode}
                aria-label='camera-settings'
                disabled={mergedOptions.cameraSettings.disabled}
                style={{
                  backgroundColor: isCameraEditMode ? '#e3f2fd' : '#fff',
                  border: isCameraEditMode
                    ? '1px solid #2196f3'
                    : '1px solid #eee',
                  opacity: mergedOptions.cameraSettings.disabled ? 0.5 : 1,
                  cursor: mergedOptions.cameraSettings.disabled
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                <SettingsIcon width={16} height={16} />
              </ToolButton>
            )} */}
            {mergedOptions.exitButton.show && (
              <ToolButton
                onClick={() => setIsConfirmModalOpen(true)}
                aria-label='exit'
                disabled={mergedOptions.exitButton.disabled}
                style={{
                  opacity: mergedOptions.exitButton.disabled ? 0.5 : 1,
                  cursor: mergedOptions.exitButton.disabled
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                <ExitIcon width={16.714} height={20} color={'#333'} />
              </ToolButton>
            )}
          </ToolbarSection>
        </ControlsWrapper>
      </NavigationContainer>
      {showPositionControls && mergedOptions.locationControl.show && (
        <PositionControls
          isShow={showPositionControls}
          tourId={tourId}
          currentSceneId={currentSceneId}
          onClose={onToggleShowPositionControls}
          onClickLocation={onClickLocation}
        />
      )}
      <ConsultationEndModal
        open={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
        }}
        onConfirm={() => {
          handleCloseWindow();
        }}
      />
    </>
  );
};
