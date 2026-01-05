/**
 * WebSocket Emit Events Enum
 * 웹소켓 emit 이벤트들을 통합 관리하기 위한 enum
 */
export enum WsEmitEventsEnum {
  // 일반 메시지 이벤트
  MESSAGE = 'message',

  // 화이트보드 관련 이벤트
  WHITEBOARD_UPDATE = 'slideList',

  // 액터별 상담실 상태 이벤트 체크
  CHECK_MANAGER_JOIN = 'check-manager-join',
  CHECK_VISITOR_JOIN = 'check-visitor-join',

  // 상담실 정보 조회
  GET_ROOM_INFO = 'get-room-info',

  //---------

  // 상담실 상태 관련 이벤트
  CONSULTATION_STATUS_RESPONSE = 'consultation-status-response',
  CONSULTATION_STATUS_UPDATE = 'consultation-status-update',

  MANAGER_READY = 'manager-ready',
  VISITOR_READY = 'visitor-ready',

  // 상담실 생명주기 이벤트
  MANAGER_END = 'manager-end',
  VISITOR_END = 'visitor-end',
  CONSULTATION_ENDED = 'consultation-ended',
  CONSULTATION_RESTARTED = 'consultation-restarted',

  VIEWPORT_SYNC = 'viewport-sync',
  POINTER_MOVE = 'pointer-move',

  ADMIN_NOTIFICATION = 'admin-notification',

  SCENE_CHANGE = 'scene-change',
  VIEW_SYNC = 'view-sync',
  USER_PRESENCE = 'user-presence',
  DEVICE_INFO = 'device-info',
  CAMERA_ROTATION = 'camera-rotation',
  CAMERA_FOV = 'camera-fov',
  CONSULTATION_ENDING = 'consultation-ending',
  MARKER_CLICK = 'marker-click',
  REMOTE_POPUP_CLOSED = 'remote-popup-closed',

  // WebRTC 시그널링 이벤트
  WEBRTC_OFFER = 'webrtc-offer',
  WEBRTC_ANSWER = 'webrtc-answer',
  WEBRTC_ICE_CANDIDATE = 'webrtc-ice-candidate',
  RTC_SCREEN_SHARE_START = 'rtc-screen-share-start',
  RTC_SCREEN_SHARE_END = 'rtc-screen-share-end',
  RTC_CONNECTION_STATE = 'rtc-connection-state',

  ZOOM_SHARE_CLICK = 'zoom-share-click',
}
