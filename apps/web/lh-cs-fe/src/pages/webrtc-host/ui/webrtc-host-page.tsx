import { WebRTCHostViewer } from '@/features/webrtc-viewer';
import { Alert, Button, Container } from '@mui/material';
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export const WebRTCHostPage: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 쿼리 파라미터에서 tourCdnId 가져오기
  const tourCdnId = searchParams.get('tourCdnId');

  // // 새창에서 스트리밍 시작하기
  // const startStreamingInNewWindow = useCallback(() => {
  //   if (!consultationId || !tourCdnId) return;

  //   // 현재 URL에 autoStart 파라미터 추가
  //   const currentUrl = new URL(window.location.href);
  //   currentUrl.searchParams.set('autoStart', 'true');

  // }, [consultationId, tourCdnId]);

  if (!consultationId) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          상담 ID가 필요합니다. URL에 consultationId를 포함해주세요.
        </Alert>
        <Button variant='contained' onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </Container>
    );
  }

  if (!tourCdnId) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          투어 CDN ID가 필요합니다. URL에 tourCdnId 쿼리 파라미터를
          포함해주세요.
          <br />
          예: /webrtc/host/{consultationId}?tourCdnId=your-tour-id
        </Alert>
        <Button variant='contained' onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* 새창 열기 컨트롤 패널 - autoStart가 없을 때만 표시 */}

      {/* WebRTCHostViewer를 전체 화면으로 표시 */}
      <WebRTCHostViewer
        consultationId={consultationId}
        tourCdnId={tourCdnId}
        onConnectionStateChange={(state) => {
          console.log('Host connection state:', state);
        }}
        onStreamingStart={() => {
          console.log('Host streaming started');
        }}
        onStreamingEnd={() => {
          console.log('Host streaming ended');
        }}
      />
    </>
  );
};
