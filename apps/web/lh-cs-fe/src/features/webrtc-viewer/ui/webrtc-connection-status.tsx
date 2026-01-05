import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { formatConnectionState } from '../lib/webrtc-utils';

interface WebRTCConnectionStatusProps {
  connectionState: RTCPeerConnectionState;
  isWebSocketConnected?: boolean;
  userType?: 'HOST' | 'VISITOR' | null;
  turnServerUrl?: string;
  className?: string;
}

export const WebRTCConnectionStatus: React.FC<WebRTCConnectionStatusProps> = ({
  connectionState,
  isWebSocketConnected,
  userType,
  turnServerUrl,
  className,
}) => {
  const getConnectionColor = (state: RTCPeerConnectionState) => {
    switch (state) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'failed':
      case 'disconnected':
        return 'error';
      case 'closed':
        return 'default';
      case 'new':
      default:
        return 'info';
    }
  };

  const getWebSocketColor = (connected: boolean) => {
    return connected ? 'success' : 'error';
  };

  return (
    <Box className={className} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Chip
          label={`연결 상태: ${formatConnectionState(connectionState)}`}
          color={getConnectionColor(connectionState)}
          size='small'
        />

        {typeof isWebSocketConnected === 'boolean' && (
          <Chip
            label={`WebSocket: ${isWebSocketConnected ? '연결됨' : '연결 안됨'}`}
            color={getWebSocketColor(isWebSocketConnected)}
            size='small'
          />
        )}

        {userType && (
          <Chip
            label={`역할: ${userType}`}
            color={userType === 'HOST' ? 'primary' : 'secondary'}
            size='small'
          />
        )}
      </Box>

      {turnServerUrl && (
        <Typography variant='caption' color='text.secondary'>
          TURN 서버: {turnServerUrl}
        </Typography>
      )}
    </Box>
  );
};
