import { io, Socket } from 'socket.io-client';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { resolveWebSocketUrl } from '@/shared/lib/url/resolve-websocket-url';

export interface WebRTCSignalingMessage {
  type: WsEmitEventsEnum;
  data: any;
  userId: string;
  sessionId: string;
}

export class WebRTCSignalingClient {
  private socket: Socket | null = null;
  private consultationId: string;
  private userId: string;
  private userType: 'HOST' | 'VISITOR';

  // 시그널링 메시지 핸들러들
  private onOfferReceived?: (offer: RTCSessionDescriptionInit) => void;
  private onAnswerReceived?: (answer: RTCSessionDescriptionInit) => void;
  private onIceCandidateReceived?: (candidate: RTCIceCandidate) => void;
  private onScreenShareStartHandler?: () => void;
  private onScreenShareEndHandler?: () => void;
  private onErrorHandler?: (error: string) => void;

  constructor(
    consultationId: string,
    userType: 'HOST' | 'VISITOR',
    userId: string = `${userType.toLowerCase()}-${Date.now()}`
  ) {
    this.consultationId = consultationId;
    this.userType = userType;
    this.userId = userId;
  }

  // WebSocket 연결 초기화
  async connect(): Promise<void> {
    const wsUrl = resolveWebSocketUrl(import.meta.env.VITE_WS_URL);

    this.socket = io(wsUrl, {
      query: {
        sessionId: this.consultationId,
      },
      transports: ['websocket', 'polling'],
      withCredentials: true, // credentials 추가
    });

    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        console.log(
          `🔌 WebRTC Signaling connected: ${this.userType} in room ${this.consultationId}`
        );
        this.setupMessageHandlers();
        resolve();
      });

      this.socket!.on('connect_error', (error) => {
        console.error('WebRTC Signaling connection error:', error);
        reject(error);
      });
    });
  }

  // 메시지 핸들러 설정
  private setupMessageHandlers(): void {
    if (!this.socket) return;

    this.socket.on('lh-live-chat', (data: string | object) => {
      try {
        console.log('📩 Raw WebSocket data received:', data);

        const parseMessage = (payload: string | object): WebRTCSignalingMessage => {
          if (typeof payload === 'string') {
            return JSON.parse(payload) as WebRTCSignalingMessage;
          }

          if (typeof payload === 'object' && payload !== null) {
            return payload as WebRTCSignalingMessage;
          }

          throw new Error('Unsupported payload type for signaling message');
        };

        const message = parseMessage(data);

        // 자신이 보낸 메시지는 무시
        if (message.userId === this.userId) {
          console.log('⏭️ Ignoring own message:', message.userId);
          return;
        }

        // console.log(`📩 WebRTC Signaling received:`, message.type, message);
        // console.log(`📩 Message data:`, JSON.stringify(message.data, null, 2));

        switch (message.type) {
          case WsEmitEventsEnum.WEBRTC_OFFER:
            if (this.userType === 'VISITOR' && this.onOfferReceived) {
              // Offer 데이터 검증
              const offer = message.data.offer;
              if (offer && offer.type && offer.sdp) {
                console.log('📩 Valid offer received:', offer.type);
                this.onOfferReceived(offer);
              } else {
                console.error('❌ Invalid offer received:', offer);
              }
            }
            break;

          case WsEmitEventsEnum.WEBRTC_ANSWER:
            if (this.userType === 'HOST' && this.onAnswerReceived) {
              // Answer 데이터 검증
              const answer = message.data.answer;
              if (answer && answer.type && answer.sdp) {
                console.log('📩 Valid answer received:', answer.type);
                this.onAnswerReceived(answer);
              } else {
                console.error('❌ Invalid answer received:', answer);
              }
            }
            break;

          case WsEmitEventsEnum.WEBRTC_ICE_CANDIDATE:
            if (this.onIceCandidateReceived) {
              // ICE Candidate 데이터 검증
              const candidate = message.data.candidate;
              if (
                candidate &&
                candidate.candidate &&
                candidate.sdpMid !== undefined &&
                candidate.sdpMLineIndex !== undefined
              ) {
                console.log('📩 Valid ICE candidate received');
                this.onIceCandidateReceived(candidate);
              } else {
                console.error('❌ Invalid ICE candidate received:', candidate);
              }
            }
            break;

          case WsEmitEventsEnum.RTC_SCREEN_SHARE_START:
            if (this.userType === 'VISITOR' && this.onScreenShareStartHandler) {
              this.onScreenShareStartHandler();
            }
            break;

          case WsEmitEventsEnum.RTC_SCREEN_SHARE_END:
            if (this.userType === 'VISITOR' && this.onScreenShareEndHandler) {
              this.onScreenShareEndHandler();
            }
            break;
        }
      } catch (error) {
        const errorMessage = `Failed to parse WebRTC signaling message: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);

        // 에러를 상위로 전파
        if (this.onErrorHandler) {
          this.onErrorHandler(errorMessage);
        }
      }
    });
  }

  // Offer 전송 (HOST → VISITOR)
  async sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    console.log(
      '📤 Sending WebRTC Offer:',
      offer.type,
      offer.sdp?.slice(0, 100) + '...'
    );
    await this.sendMessage(WsEmitEventsEnum.WEBRTC_OFFER, { offer });
    // console.log('✅ WebRTC Offer sent successfully');
  }

  // Answer 전송 (VISITOR → HOST)
  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    // console.log(
    //   '📤 Sending WebRTC Answer:',
    //   answer.type,
    //   answer.sdp?.slice(0, 100) + '...'
    // );
    // console.log('📤 Answer data:', JSON.stringify({ answer }, null, 2));
    await this.sendMessage(WsEmitEventsEnum.WEBRTC_ANSWER, { answer });
    // console.log('✅ WebRTC Answer sent successfully');
  }

  // ICE Candidate 전송 (양방향)
  async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    await this.sendMessage(WsEmitEventsEnum.WEBRTC_ICE_CANDIDATE, {
      candidate,
    });
  }

  // 화면 공유 시작 알림
  async notifyScreenShareStart(): Promise<void> {
    await this.sendMessage(WsEmitEventsEnum.RTC_SCREEN_SHARE_START, {});
  }

  // 화면 공유 종료 알림
  async notifyScreenShareEnd(): Promise<void> {
    await this.sendMessage(WsEmitEventsEnum.RTC_SCREEN_SHARE_END, {});
  }

  // 연결 상태 전송
  async sendConnectionState(state: RTCPeerConnectionState): Promise<void> {
    await this.sendMessage(WsEmitEventsEnum.RTC_CONNECTION_STATE, { state });
  }

  // 공통 메시지 전송
  private async sendMessage(type: WsEmitEventsEnum, data: any): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const message: WebRTCSignalingMessage = {
      type,
      data,
      userId: this.userId,
      sessionId: this.consultationId,
    };

    console.log(`📤 WebRTC Signaling sending:`, type, message);

    this.socket.emit('lh-live-chat', JSON.stringify(message));
  }

  // 이벤트 핸들러 등록
  onOffer(handler: (offer: RTCSessionDescriptionInit) => void): void {
    this.onOfferReceived = handler;
  }

  onAnswer(handler: (answer: RTCSessionDescriptionInit) => void): void {
    this.onAnswerReceived = handler;
  }

  onIceCandidate(handler: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateReceived = handler;
  }

  onScreenShareStart(handler: () => void): void {
    this.onScreenShareStartHandler = handler;
  }

  onScreenShareEnd(handler: () => void): void {
    this.onScreenShareEndHandler = handler;
  }

  onError(handler: (error: string) => void): void {
    this.onErrorHandler = handler;
  }

  // 연결 종료
  disconnect(): void {
    if (this.socket) {
      console.log(`🔌 WebRTC Signaling disconnecting: ${this.userType}`);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 연결 상태 확인
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
