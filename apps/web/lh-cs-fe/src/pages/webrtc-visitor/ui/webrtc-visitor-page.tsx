import { WebRTCVisitorViewer } from '@/features/webrtc-viewer';
import { Alert, Button, Container } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const WebRTCVisitorPage: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const [isStreamEnded, setIsStreamEnded] = useState(false);

  // 상태에 따른 placeholder 메시지 결정
  const getPlaceholderMessage = () => {
    if (isStreamEnded) {
      return '화면 공유가 종료되었습니다.';
    }

    if (
      connectionState === 'failed' ||
      connectionState === 'disconnected' ||
      connectionState === 'closed'
    ) {
      return '';
    }

    if (connectionState === 'connecting') {
      return '곧 상담원과 연결됩니다. 잠시만 기다려주세요...';
    }

    if (connectionState === 'connected') {
      return 'Host의 송출을 기다리는 중...';
    }

    return '곧 상담원과 연결됩니다. 잠시만 기다려주세요...';
  };

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

  return (
    <div>
      <WebRTCVisitorViewer
        consultationId={consultationId}
        placeholder={getPlaceholderMessage()}
        onConnectionStateChange={(state) => {
          console.log('Visitor connection state:', state);
          setConnectionState(state);
        }}
        onStreamReceived={(stream) => {
          console.log('Visitor stream received:', stream);
          setIsStreamEnded(false); // 스트림을 받으면 종료 상태 해제
        }}
        onStreamEnded={() => {
          console.log('Visitor stream ended');
          setIsStreamEnded(true);
        }}
      />
    </div>
  );
};
