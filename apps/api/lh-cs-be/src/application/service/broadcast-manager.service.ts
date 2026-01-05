import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { LhApiClientService } from './consultation-api-client.service';

/**
 * WebSocket 브로드캐스트 관리 서비스
 * 모든 WebSocket 브로드캐스트 로직을 중앙화하여 관리
 */
@Injectable()
export class BroadcastManagerService {
  private readonly logger = new Logger(BroadcastManagerService.name);
  private io: Server;

  constructor(private readonly lhApiClient: LhApiClientService) {}

  /**
   * Socket.IO 서버 인스턴스 설정
   */
  setSocketServer(io: Server): void {
    this.io = io;
  }

  // /**
  //  * 상담실 상태 변경을 모든 관련 클라이언트에게 브로드캐스트
  //  */
  // async broadcastConsultationStatus(
  //   statusUpdate: ConsultationStatusUpdate
  // ): Promise<void> {
  //   const { consultationId } = statusUpdate;

  //   // 상담 세부 정보 조회하여 consultingStartedAt 가져오기
  //   let consultingStartedAt: string | undefined;
  //   try {
  //     const consultationDetails =
  //       await this.lhApiClient.getConsultationDetails(consultationId);
  //     consultingStartedAt = consultationDetails?.consultingStartedAt;
  //     this.logger.log(
  //       `Retrieved consultation details for ${consultationId}: startTime=${consultingStartedAt}`
  //     );
  //   } catch (error) {
  //     this.logger.warn(
  //       `Failed to get consultation details for ${consultationId}:`,
  //       error
  //     );
  //   }

  //   // 상담방 내 모든 클라이언트에게 전송
  //   this.io
  //     .to(consultationId)
  //     .emit(WsEmitEventsEnum.CONSULTATION_STATUS_UPDATE, statusUpdate);

  //   // lh-live-chat 형식으로도 전송 (기존 프론트엔드 호환성)
  //   const lhMessage = JSON.stringify({
  //     type: 'CONSULTATION_STATUS_UPDATE',
  //     data: {
  //       consultationId: statusUpdate.consultationId,
  //       visitorId: statusUpdate.visitorId,
  //       status: statusUpdate.status,
  //       connectedUsers: statusUpdate.connectedUsers,
  //       consultingStartedAt, // 상담 시작 시간 추가
  //       timestamp: statusUpdate.timestamp,
  //     },
  //     sessionId: consultationId,
  //     timestamp: statusUpdate.timestamp,
  //     userId: 'system',
  //   });

  //   // 상담방 클라이언트들에게 전송
  //   this.io.to(consultationId).emit(WsEmitEventsEnum.MESSAGE, lhMessage);

  //   // 관리자 모니터링 채널에도 전송 (전체 상담실 상태 관리용)
  //   this.io.to('admin-monitor').emit(WsEmitEventsEnum.MESSAGE, lhMessage);

  //   this.logger.log(
  //     `Broadcasted status update for consultation ${consultationId}: ${statusUpdate.status}`
  //   );
  // }

  /**
   * 상담 종료 요청 이벤트 (5분 카운트다운 시작)
   */
  broadcastConsultationEnding(consultationId: string): void {
    // const endingMessage = {
    //   type: 'CONSULTATION_ENDING',
    //   data: {
    //     consultationId,
    //     message: '5분후에 상담이 종료됩니다',
    //     timestamp: new Date().toISOString(),
    //   },
    // };

    this.logger.log(`Broadcasted consultation ending for ${consultationId}`);
  }

  /**
   * 상담 완전 종료 이벤트 (일반 투어 모드로 전환)
   */
  broadcastConsultationEnded(consultationId: string): void {
    console.log('broadcastConsultationEnded called for', consultationId);
    const endedMessage = {
      type: 'CONSULTATION_ENDED',
      data: {
        consultationId,
        message:
          '상담이 종료되었습니다. 이제 자유롭게 투어를 둘러보실 수 있습니다.',
        timestamp: new Date().toISOString(),
      },
    };

    // 상담방 내 모든 클라이언트에게 전송
    this.io
      .to(consultationId)
      .emit(WsEmitEventsEnum.CONSULTATION_ENDED, endedMessage.data);

    // lh-live-chat 형식으로도 전송
    this.io.to(consultationId).emit(
      WsEmitEventsEnum.MESSAGE,
      JSON.stringify({
        ...endedMessage,
        sessionId: consultationId,
        userId: 'system',
      })
    );

    this.logger.log(`Broadcasted consultation ended for ${consultationId}`);
  }

  /**
   * 상담 재시작 이벤트 (END → READY 상태로 복원)
   */
  broadcastConsultationRestarted(consultationId: string): void {
    const restartedMessage = {
      type: 'CONSULTATION_RESTARTED',
      data: {
        consultationId,
        message: '상담이 재시작되었습니다.',
        timestamp: new Date().toISOString(),
      },
    };

    // 상담방 내 모든 클라이언트에게 전송
    this.io
      .to(consultationId)
      .emit(WsEmitEventsEnum.CONSULTATION_RESTARTED, restartedMessage.data);

    // lh-live-chat 형식으로도 전송
    this.io.to(consultationId).emit(
      WsEmitEventsEnum.MESSAGE,
      JSON.stringify({
        ...restartedMessage,
        sessionId: consultationId,
        userId: 'system',
      })
    );

    // 관리자 모니터링 채널에도 전송 (상담실 목록 업데이트용)
    this.io.to('admin-monitor').emit(
      WsEmitEventsEnum.MESSAGE,
      JSON.stringify({
        ...restartedMessage,
        sessionId: consultationId,
        userId: 'system',
      })
    );

    this.logger.log(`Broadcasted consultation restarted for ${consultationId}`);
  }

  /**
   * 룸에 메시지 전송 (기존 sendMessageToRoom 로직)
   */
  sendMessageToRoom(room: string, message: string): void {
    const messageSize = Buffer.byteLength(message, 'utf8');
    this.logger.log('Received message size in bytes:', messageSize);

    this.io.to(room).emit(WsEmitEventsEnum.MESSAGE, message);
  }

  forwardToOtherParticipants(
    roomId: string,
    senderId: string,
    message: string
  ): void {
    this.io.to(roomId).except(senderId).emit('lh-live-chat', message);
  }
}
