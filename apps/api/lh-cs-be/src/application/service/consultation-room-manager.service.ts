import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import {
  ConsultationStatus,
  UserRoleEnum,
} from '@/infrastructure/repository/entity';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConsultationService } from './consultation.service';

export interface ConsultationRoom {
  consultationId: string;
  managerId: string | null;
  visitorId: string | null;
  status: ConsultationStatus;
}

@Injectable()
export class ConsultationRoomManagerService {
  constructor(
    private readonly consultationService: ConsultationService,
    private readonly logger: Logger = new Logger(
      ConsultationRoomManagerService.name
    )
  ) {}

  // 상담실별 연결 상태 추적
  private rooms = new Map<string, ConsultationRoom>();

  // Socket.IO 서버 인스턴스
  private io: Server;

  /**
   * Socket.IO 서버 설정
   */
  setSocketServer(io: Server): void {
    this.io = io;
  }

  /**
   * 관리자에게 알림 전송
   */
  public notifyAdmin(data: any): void {
    if (this.io) {
      this.io.to('admin-user').emit('lh-live-chat', JSON.stringify(data));
    }
  }

  /**
   * 연결 상태에 따른 상담실 상태 결정
   */
  private determineConsultationStatus(
    adminConnected: boolean,
    visitorConnected: boolean
  ): ConsultationStatus {
    if (adminConnected && visitorConnected) {
      return ConsultationStatus.CONSULTING; // 둘 다 연결되면 상담중
    }
    return ConsultationStatus.READY; // 그 외의 경우는 모두 대기중
  }

  createRoom(
    consultationId: string,
    managerId: string | null,
    visitorId: string | null
  ): ConsultationRoom {
    const newRoom: ConsultationRoom = {
      consultationId,
      managerId: managerId,
      visitorId: visitorId,
      status: ConsultationStatus.READY,
    };

    console.log(
      'CHECK MANAGER CAN JOIN createRoom============================='
    );
    console.log(
      '새로운 룸을 생성합니다.',
      newRoom.status,
      JSON.stringify(newRoom),
      'managerId:======',
      managerId
    );
    console.log('=============================');

    this.rooms.set(consultationId, newRoom);
    return newRoom;
  }

  /**
   * 특정 상담실의 현재 상태 조회
   */
  getRoom(consultationId: string): ConsultationRoom | null {
    return this.rooms.get(consultationId) || null;
  }

  /**
   * 모든 상담실 상태 조회 (디버깅용)
   */
  getAllRooms(): Map<string, ConsultationRoom> {
    return new Map(this.rooms);
  }

  /**
   * 상담실 정리 (필요시)
   */
  cleanupRoom(consultationId: string): void {
    this.rooms.delete(consultationId);
    this.logger.log(`Cleaned up room: ${consultationId}`);
  }

  /**
   * 사용자 연결 정보 추가/업데이트 (상태 업데이트 포함)
   */
  addConnectedUser(consultationId: string, userType: UserRoleEnum): void {
    const room = this.rooms.get(consultationId) || {
      consultationId,
      managerId: null,
      visitorId: null,
      status: ConsultationStatus.READY,
    };

    if (
      userType === UserRoleEnum.ADMIN ||
      userType === UserRoleEnum.SUPER_ADMIN
    ) {
      if (!room.managerId) {
        throw new Error('Manager ID is required for ADMIN userType');
      }
      room.managerId = room.managerId; // userId 할당
    }

    if (userType === UserRoleEnum.VISITOR) {
      if (!room.visitorId) {
        throw new Error('Visitor ID is required for VISITOR userType');
      }
      room.visitorId = room.visitorId; // visitorId 할당
    }
    room.status = this.determineConsultationStatus(
      !!room.managerId,
      !!room.visitorId
    );
    this.rooms.set(consultationId, room);
  }

  /**
   * 사용자 연결 해제 (재연결 대기 로직 포함)
   */
  removeConnectedUser(consultationId: string, socketId: string): void {
    const room = this.rooms.get(consultationId);
    if (!room) return;

    room.managerId = null;
    room.visitorId = null;
    room.status = ConsultationStatus.END;

    this.rooms.set(consultationId, room);
  }

  /**
   * 사용자 재연결 처리
   */
  handleReconnection(consultationId: string, managerId: string): void {
    const room = this.rooms.get(consultationId);
    if (!room) return;

    if (!room.managerId) {
      room.managerId = managerId;
    }

    room.status = this.determineConsultationStatus(
      !!room.managerId,
      !!room.visitorId
    );
    this.rooms.set(consultationId, room);
  }

  /**
   * 관리자 입장 가능 여부 체크
   * - 상담실이 없으면 생성하고 입장 허용
   * - 상담실에 이미 상담사가 있는 경우 입장 불가
   * - 상담실에 방문자가 있는 경우 상담 상태를 CONSULTING으로 변경
   */
  async checkManagerCanJoin(
    consultationId: string,
    managerId: string,
    client: Socket
  ): Promise<boolean> {
    const room = this.rooms.get(consultationId);

    if (!managerId) {
      this.logger.warn(
        `Manager ID is required for consultation ${consultationId}`
      );
      return false;
    }

    if (!room) {
      const newRoom = this.createRoom(consultationId, managerId, null);
      const wsData = {
        type: WsEmitEventsEnum.CHECK_MANAGER_JOIN,
        data: {
          canJoin: true,
          managerId,
          visitorId: newRoom.visitorId,
        },
        message: '새로운 상담실을 생성합니다.',
        sessionId: consultationId,
      };
      client.emit('lh-live-chat', wsData);
      this.notifyAdmin({ ...wsData, roomStatus: newRoom.status });
      return true;
    }

    console.log('checkManagerCanJoin', room);

    if (room) {
      if (room.managerId) {
        const wsData = {
          type: WsEmitEventsEnum.CHECK_MANAGER_JOIN,
          data: {
            canJoin: false,
            managerId,
            visitorId: room.visitorId,
            status: room.status,
          },
          message: '이미 상담사가 입장해 있습니다.',
          sessionId: consultationId,
        };
        room.managerId = managerId; // managerId 할당

        client.emit('lh-live-chat', wsData);
        this.logger.log(
          `Manager ${managerId} cannot join consultation ${consultationId}: already has a manager`
        );

        // 관리자에게 알림
        this.notifyAdmin({
          consultationId,
          managerId,
          reason: '이미 상담사가 입장해 있습니다.',
        });

        console.log('CHECK MANAGER CAN JOIN =============================');
        console.log(
          '이미 상담사가 입장해 있습니다.',
          room.status,
          JSON.stringify(room),
          'managerId:======',
          managerId // 현재 확인중
        );
        console.log('=============================');

        return false;
      } else {
        room.managerId = managerId; // managerId 할당
        const wsData = {
          type: WsEmitEventsEnum.CHECK_MANAGER_JOIN,
          data: {
            canJoin: true,
            managerId,
            visitorId: room.visitorId,
            status: room.status,
          },
          message: '상담사가 입장할 수 있습니다.',
          sessionId: consultationId,
        };

        client.emit('lh-live-chat', wsData);
        this.logger.log(
          `Manager ${managerId} can join consultation ${consultationId}`
        );

        if (room.visitorId) {
          wsData.data.status = ConsultationStatus.CONSULTING;
          room.status = ConsultationStatus.CONSULTING;

          // DB 상태도 업데이트 필요시 여기서 처리

          this.rooms.set(consultationId, room);
        } else {
          wsData.data.status = ConsultationStatus.READY;
          room.status = ConsultationStatus.READY;
        }

        await this.consultationService.updateConsultationStatus(
          consultationId,
          wsData.data.status
        );

        this.notifyAdmin({
          ...wsData,
          roomStatus: room.status,
        });

        this.rooms.set(consultationId, room);

        console.log('CHECK MANAGER CAN JOIN =============================');
        console.log(
          '상담사가 입장할 수 있습니다.',
          room.status,
          JSON.stringify(room),
          'managerId:======',
          managerId // 현재 확인중
        );
        console.log('=============================');

        return true;
      }
    }

    return false;
  }

  /**
   * 방문자 입장 가능 여부 확인
   */
  checkVisitorCanJoin(
    consultationId: string,
    visitorId: string,
    client: Socket
  ): boolean {
    const room = this.rooms.get(consultationId);

    if (!visitorId) {
      this.logger.warn(
        `Visitor ID is required for consultation ${consultationId}`
      );
      return false;
    }

    if (!room) {
      const newRoom = this.createRoom(consultationId, null, visitorId);
      const wsData = {
        type: WsEmitEventsEnum.CHECK_VISITOR_JOIN,
        data: {
          canJoin: false, // 방문자가 상담실을 이미 생성한 후 방문자는 입장할 수 없다.
          visitorId,
          status: newRoom.status,
        },
        message: '새로운 상담실을 생성합니다.',
        sessionId: consultationId,
      };
      client.emit('lh-live-chat', wsData);
      this.notifyAdmin({ ...wsData, roomStatus: newRoom.status });
    }

    if (room) {
      if (room.visitorId) {
        const wsData = {
          type: WsEmitEventsEnum.CHECK_VISITOR_JOIN,
          data: {
            canJoin: false,
            consultationId,
            visitorId,
            status: room.status,
          },
          message: '이미 방문자가 입장해 있습니다.',
          sessionId: consultationId,
        };
        client.emit('lh-live-chat', wsData);
      } else {
        const wsData = {
          type: WsEmitEventsEnum.CHECK_VISITOR_JOIN,
          data: {
            canJoin: true,
            consultationId,
            visitorId,
            status: room.status,
          },
          message: '입장할 수 있습니다.',
          sessionId: consultationId,
        };

        // 방문자 정보를 룸 상태에 반영해 추후 GET_ROOM_INFO에서 감지 가능하도록 처리
        room.visitorId = visitorId;
        room.status = this.determineConsultationStatus(
          !!room.managerId,
          !!room.visitorId
        );
        this.rooms.set(consultationId, room);

        client.emit('lh-live-chat', wsData);
      }
      return false;
    }

    return true;
  }

  async setVisitorReadyState(
    consultationId: string,
    visitorId: string,
    client: Socket
  ): Promise<void> {
    // 방문자 준비 상태 설정 로직 구현
    const room = this.rooms.get(consultationId);
    if (!room) return;

    if (!room.visitorId) {
      room.visitorId = visitorId; // visitorId 할당
    }

    // 상태가 READY일 때 MANAGER가 있으면 CONSULTING으로 변경
    const status = this.determineConsultationStatus(
      !!room.managerId,
      !!room.visitorId
    );

    this.rooms.set(consultationId, room);
    const wsData = {
      type: WsEmitEventsEnum.VISITOR_READY,
      data: {
        consultationId,
        visitorId,
        managerId: room.managerId,
        status: status,
      },
      message: '방문자가 준비되었습니다.',
      sessionId: consultationId,
    };
    client.emit('lh-live-chat', wsData);

    // 방문자가 READY 상태가 되면
    // 만약 visitorId가 설정되어 있고 managerId도 설정되어 있으면
    // 상담 상태를 CONSULTING으로 변경
    // 상태를 DB에도 반영
    // 이 경우는 managerId가 있는 상태라면 READY → CONSULTING 전환만 해당됨

    room.status = status;

    // DB 상태도 업데이트 필요시 여기서 처리
    await this.consultationService.updateConsultationStatusByVisitorConnection(
      consultationId,
      room.managerId !== null,
      room.visitorId !== null
    );

    // 상태를 업데이트 한 후에 관리자 페이지에 알려주어야 한다.
    console.log('setVisitorReadyState =============================');
    console.log(
      'Visitor is ready - updating status if needed',
      room.managerId,
      room.status,
      JSON.stringify(room)
    );
    console.log('=============================');

    // const status: ConsultationStatus | void =
    //   await this.consultationService.updateConsultationStatusByConnection(
    //     consultationId,
    //     room.managerId !== null,
    //     room.visitorId !== null
    //   );

    this.rooms.set(consultationId, room);

    if (room.status) {
      // 관리자에게 알림
      this.notifyAdmin({ ...wsData, roomStatus: room.status });
    }
  }

  async endConsultation(consultationId: string, client: Socket): Promise<void> {
    const room = this.rooms.get(consultationId);
    if (room) {
      const oldRoom = { ...room }; // 상태 변경 전 정보 보관

      // Manager 퇴장 처리
      room.managerId = null;
      room.status = ConsultationStatus.END;

      this.logger.log(
        `Manager left consultation ${consultationId}. Old managerId: ${oldRoom.managerId}, New managerId: ${room.managerId}`
      );

      // DB 상태도 업데이트 (5분 지연 종료 시작)
      try {
        await this.consultationService.requestEndConsultation(consultationId);
        this.logger.log(
          `Requested end consultation for ${consultationId} in database`
        );
      } catch (error) {
        this.logger.error(
          `Failed to request end consultation in database: ${error.message}`
        );
      }

      const wsData = {
        type: WsEmitEventsEnum.MANAGER_END,
        data: {
          consultationId,
          message: '상담이 종료되었습니다.',
          status: room.status,
          managerId: room.managerId, // null이어야 함
          visitorId: room.visitorId,
        },
        sessionId: consultationId, // 🔥 sessionId 추가
      };

      client.to(consultationId).emit('lh-live-chat', wsData);
      client.emit('lh-live-chat', wsData); // 본인에게도 전송

      // 관리자에게 알림
      this.notifyAdmin(wsData);

      // 룸 상태 업데이트 (중요!)
      this.rooms.set(consultationId, room);

      this.logger.log(
        `Room updated - ConsultationId: ${consultationId}, ManagerId: ${room.managerId}, Status: ${room.status}`
      );
    } else {
      this.logger.warn(
        `Attempted to end consultation ${consultationId} but room not found`
      );
    }
    this.logger.log(`Consultation ${consultationId} ended.`);
  }

  /**
   * 특정 상담실 정보를 클라이언트에게 전송
   */
  getRoomInfo(consultationId: string, client: Socket): void {
    const room = this.rooms.get(consultationId);

    if (room) {
      client.emit('lh-live-chat', {
        type: WsEmitEventsEnum.GET_ROOM_INFO,
        data: {
          consultationId: room.consultationId,
          managerId: room.managerId,
          visitorId: room.visitorId,
          status: room.status,
          hasManager: !!room.managerId,
          hasVisitor: !!room.visitorId,
        },
        sessionId: consultationId,
      });

      this.logger.log(`Room info sent for consultation ${consultationId}`);
    } else {
      client.emit('lh-live-chat', {
        type: WsEmitEventsEnum.GET_ROOM_INFO,
        data: {
          consultationId,
          managerId: null,
          visitorId: null,
          status: ConsultationStatus.READY,
          hasManager: false,
          hasVisitor: false,
          exists: false,
        },
        sessionId: consultationId,
      });

      this.logger.log(`Room not found for consultation ${consultationId}`);
    }
  }

  /**
   * 모든 상담실 정보를 클라이언트에게 전송 (디버깅용)
   */
  getAllRoomsInfo(client: Socket): void {
    const allRooms = Array.from(this.rooms.entries()).map(([id, room]) => ({
      consultationId: id,
      managerId: room.managerId,
      visitorId: room.visitorId,
      status: room.status,
      hasManager: !!room.managerId,
      hasVisitor: !!room.visitorId,
    }));

    client.emit('lh-live-chat', {
      type: WsEmitEventsEnum.GET_ROOM_INFO,
      data: {
        allRooms,
        totalRooms: allRooms.length,
      },
    });

    this.logger.log(`All rooms info sent: ${allRooms.length} rooms`);
  }

  exitVisitor(consultationId: string, client: Socket): void {
    const room = this.rooms.get(consultationId);
    if (room) {
      const oldVisitorId = room.visitorId; // 이탈하는 visitor ID 보관

      room.visitorId = null;

      console.log('exitVisitor =============================');
      console.log(
        '방문자가 상담에서 나갔습니다.',
        room.status,
        JSON.stringify(room),
        'visitorId:======',
        oldVisitorId // 이탈하는 visitor ID
      );
      console.log('=============================');

      const wsData = {
        type: WsEmitEventsEnum.VISITOR_END,
        data: {
          consultationId,
          message: '방문자가 상담에서 나갔습니다.',
          status: ConsultationStatus.READY,
        },
        sessionId: consultationId, // 🔥 sessionId 추가
      };

      console.log(
        '🔥 [DEBUG] Sending VISITOR_END message:',
        JSON.stringify(wsData)
      );
      // client.emit('lh-live-chat', wsData);
      client.to(consultationId).emit('lh-live-chat', wsData);

      // 관리자에게 알림
      console.log('🔥 [DEBUG] Sending VISITOR_END to admin via notifyAdmin');
      this.notifyAdmin(wsData);
      console.log('🔥 [DEBUG] VISITOR_END sent to admin');

      this.rooms.set(consultationId, room);
    } else {
      console.log(
        '🚫 [DEBUG] exitVisitor called but room not found for consultationId:',
        consultationId
      );
    }
  }

  // async disconnectedConsultation(consultationId: string) {
  //   await this.consultationService.requestEndConsultation(consultationId);
  // }
}
