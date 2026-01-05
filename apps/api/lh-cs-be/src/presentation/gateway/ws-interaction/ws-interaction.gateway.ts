import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { StatisticsService } from '@/application/service/statistics.service';
import { WhiteboardManagerService } from '@/application/service/whiteboard-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';
import { WsEventHandlerRegistry } from './handlers/ws-event-handler.registry';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',').map((origin) =>
      origin.trim()
    ) || ['http://localhost:8888'], // 개발환경 기본값 추가
    methods: ['GET', 'POST'],
    credentials: true, // credentials를 true로 변경
  },
  allowEIO4: true,
  transports: ['websocket', 'polling'],
})
export class WsInteractionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WsInteractionGateway.name);
  @WebSocketServer() io: Server;

  constructor(
    private readonly handlerRegistry: WsEventHandlerRegistry,
    private readonly consultationRoomManager: ConsultationRoomManagerService,
    private readonly broadcastManager: BroadcastManagerService,
    private readonly whiteboardManager: WhiteboardManagerService,
    private readonly statisticsService: StatisticsService
    // private readonly textModelManager: TextModelManagerService,
  ) {}

  afterInit() {
    this.logger.log('WS Initialized');
    // BroadcastManager에 Socket.IO 서버 설정
    this.broadcastManager.setSocketServer(this.io);
    // ConsultationRoomManager에 Socket.IO 서버 설정
    this.consultationRoomManager.setSocketServer(this.io);
  }

  private getSessionIdFromClient(client: Socket) {
    const query = client.handshake.query.sessionId;
    return Array.isArray(query) ? query[0] : query; // Helper function to retrieve sessionId
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const sessionId = this.getSessionIdFromClient(client); // Get sessionId from query

    const { sockets } = this.io.sockets;

    if (sessionId) {
      client.join(sessionId);
    }

    this.logger.log(
      `Client id: ${client.id} connected to session: ${sessionId}`
    );
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    // 새로 접속한 클라이언트에게 현재 세션 데이터 전송
    if (this.whiteboardManager.checkWhiteboardExists(sessionId as string)) {
      this.whiteboardManager.shareCurrentWhiteboard(
        sessionId as string,
        client
      );
    }
  }

  async handleDisconnect(client: Socket) {
    const sessionId = this.getSessionIdFromClient(client); // Helper function to get sessionId
    if (sessionId) {
      if (Array.isArray(sessionId)) {
        client.leave(sessionId[0]); // Leave room based on sessionId
      } else {
        client.leave(sessionId); // Leave room based on sessionId
      }
    }

    // 상담방 연결 해제 처리
    const { consultationId, userType } = client.data || {};

    if (consultationId && userType) {
      // 고객 퇴장 로그 수집 (고객인 경우)
      if (userType === 'visitor') {
        try {
          await this.statisticsService.createConsultationLog({
            actionType: ConsultationLogActionTypeEnum.VISITOR_EXIT,
            actionValue: client.data?.visitorId || null,
            consultationId: consultationId,
            counselorId: null,
            device: client.handshake.headers['user-agent'] as string,
            ipAddress: client.handshake.address,
          });
        } catch (error) {
          this.logger.error('Failed to log visitor exit:', error);
          // 로깅 실패는 메인 작업을 막지 않음
        }
      }

      // ConsultationRoomManager에서 사용자 제거
      this.consultationRoomManager.removeConnectedUser(
        consultationId,
        client.id
      );
    }

    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage('lh-live-chat')
  async handleLhLiveChatMessage(client: Socket, raw: any) {
    const sessionId = this.getSessionIdFromClient(client);

    this.logger.log(`Message received from client id: ${client.id}`);

    let parsedData: any;
    try {
      parsedData = typeof raw === 'string' ? JSON.parse(raw) : raw;

      if (!parsedData?.data && !sessionId) {
        throw new Error('Invalid message format or missing sessionId');
      }
    } catch (error) {
      this.logger.warn('Failed to parse message data:', error);
      return;
    }

    const type = parsedData.type as WsEmitEventsEnum;
    const handler = this.handlerRegistry.get(type);

    if (!handler) {
      this.logger.debug(`No handler registered for type ${type}`);
      return;
    }

    try {
      await handler.handle({
        parsedData,
        raw,
        client,
        sessionId: sessionId as string | undefined,
      });
    } catch (error) {
      this.logger.error(`Failed to handle WebSocket event ${type}:`, error);
    }

    return {
      event: parsedData.type,
      data: parsedData.data,
    };
  }
}
