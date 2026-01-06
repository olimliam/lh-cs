import { useFreeTourStatistics } from '@/features/statistics';
// import { SimpleTourViewer } from '@/features/tour-viewer/ui/simple-tour-viewer';
import { generateUUID } from '@/shared/lib/utils/uuid-generator';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { ToolbarProvider, ViewerProvider } from '@packages/traveler';
import React, { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SelfCheckErrorProps } from '../model/self-check-types';
import { useSelfCheckStore } from '../model/self-check.store';
import { GuidePopup } from '@/features/self-check-tour';
import { SelfCheckTourViewer } from '@/features/tour-viewer/ui/self-check-tour-viewer';

const SelfCheckContainer = styled(Box)`
  width: 100vw;
  height: calc(100% - 64px);
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
  transform: translateY(64px);
`;

const ErrorContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
`;

const ErrorMessage = styled(Box)`
  font-size: 18px;
  font-weight: 500;
  color: #d32f2f;
  margin-bottom: 16px;
  text-align: center;
`;

const ErrorDescription = styled(Box)`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1565c0;
  }
`;

const SelfCheckError: React.FC<SelfCheckErrorProps> = ({
  message,
  onRetry,
}) => (
  <ErrorContainer>
    <ErrorMessage>페이지를 로드할 수 없습니다</ErrorMessage>
    <ErrorDescription>{message}</ErrorDescription>
    {onRetry && <RetryButton onClick={onRetry}>다시 시도</RetryButton>}
  </ErrorContainer>
);

export const SelfCheckTourPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const tourCdnId = searchParams.get('tourCdnId') || '';
  const sceneIdParam = searchParams.get('sceneId');
  const initialSceneId = sceneIdParam ? Number(sceneIdParam) : undefined;
  // const { consultationId } = useParams();

  const {
    logVisitorEnter,
    logVisitorExit,
    logSceneMove,
    logPopupOpen,
    logPopupClose,
  } = useFreeTourStatistics();

  const handleSceneChange = useCallback(
    (sceneId: number) => {
      logSceneMove(visitorSessionId, String(sceneId), tourId);
      // URL 파라미터 업데이트 (선택적)
      const newParams = new URLSearchParams(searchParams);
      newParams.set('sceneId', sceneId.toString());

      // 브라우저 히스토리에 새 상태 추가하지 않고 현재 URL만 변경
      window.history.replaceState(null, '', `?${newParams.toString()}`);
    },
    [searchParams, logSceneMove]
  );

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const visitorSessionId = React.useMemo(() => {
    let sessionId = sessionStorage.getItem('free-tour-session-id');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('free-tour-session-id', sessionId);
    }
    return sessionId;
  }, []);

  const { tourId, facilityId } = useSelfCheckStore();

  useEffect(() => {
    logVisitorEnter(visitorSessionId, tourId, facilityId);

    return () => {
      logVisitorExit(visitorSessionId, tourId, facilityId);
    };
  }, []);

  const [_, setCurrentMarkerId] = React.useState<string | null>(null);

  const handleMarkerClick = useCallback(
    (markerId: number) => {
      setCurrentMarkerId((prev) => {
        if (prev && prev !== String(markerId)) {
          logPopupClose(visitorSessionId, String(prev), undefined, tourId);
        }

        if (markerId) {
          logPopupOpen(visitorSessionId, String(markerId), facilityId, tourId);
          return String(markerId);
        }

        return null;
      });
    },
    [visitorSessionId, tourId, facilityId, logPopupClose, logPopupOpen]
  );

  // tourCdnId 유효성 검사
  if (!tourCdnId) {
    return (
      <SelfCheckError
        message='tourCdnId 파라미터가 필요합니다. URL에 ?tourCdnId=your-tour-id를 추가해주세요.'
        onRetry={handleRetry}
      />
    );
  }

  // sceneId 유효성 검사 (선택적)
  if (
    sceneIdParam &&
    (isNaN(Number(sceneIdParam)) || Number(sceneIdParam) < 0)
  ) {
    return (
      <SelfCheckError
        message='sceneId 파라미터가 올바르지 않습니다. 숫자 형태의 값을 입력해주세요.'
        onRetry={handleRetry}
      />
    );
  }
  return (
    <>
      <SelfCheckContainer>
        <ViewerProvider>
          <ToolbarProvider>
            <SelfCheckTourViewer
              tourCdnId={tourCdnId}
              // consultationId={consultationId}
              initialSceneId={initialSceneId}
              onSceneChange={handleSceneChange}
              onMarkerClick={handleMarkerClick}
            />
          </ToolbarProvider>
        </ViewerProvider>
      </SelfCheckContainer>

      <GuidePopup />
    </>
  );
};
