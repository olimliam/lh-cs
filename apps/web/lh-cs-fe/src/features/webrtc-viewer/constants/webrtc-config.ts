/**
 * WebRTC 관련 설정 상수들
 */

// TURN 서버 설정 (로컬 서버 - 같은 망에서 접속 가능)
export const WEBRTC_SERVER_IP = import.meta.env.VITE_WEBRTC_SERVER_IP;
const WEBRTC_SERVER_USERNAME = import.meta.env.VITE_WEBRTC_SERVER_USERNAME;
const WEBRTC_SERVER_CREDENTIAL = import.meta.env.VITE_WEBRTC_SERVER_CREDENTIAL;
// VITE_WEBRTC_SCREEN_SHARE_MODE 값은 'current_page'(기본) 또는 'current_tab' 중 하나
const isScreenShareMode = import.meta.env.VITE_IS_PREFER_CURRENT_TAB || false;
export const IS_PREFER_CURRENT_TAB = isScreenShareMode == 'true';

export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: [`stun:${WEBRTC_SERVER_IP}:3478`],
  },
  {
    urls: [
      `turn:${WEBRTC_SERVER_IP}:3478?transport=udp`,
      `turn:${WEBRTC_SERVER_IP}:3478?transport=tcp`,
    ],
    username: `${WEBRTC_SERVER_USERNAME}`,
    credential: `${WEBRTC_SERVER_CREDENTIAL}`,
  },
];

// 화면 공유 기본 설정
export const SCREEN_SHARE_CONFIG: MediaStreamConstraints = {
  video: {
    width: 1280,
    height: 720,
    frameRate: 30,
  },
  audio: true,
  ...(IS_PREFER_CURRENT_TAB ? { preferCurrentTab: true } : {}),
};

// WebRTC 타임아웃 설정
export const WEBRTC_TIMEOUTS = {
  ICE_GATHERING_TIMEOUT: 10000, // 10초
  CONNECTION_TIMEOUT: 30000, // 30초
  ICE_GATHERING_CHECK_INTERVAL: 100, // 100ms
} as const;
