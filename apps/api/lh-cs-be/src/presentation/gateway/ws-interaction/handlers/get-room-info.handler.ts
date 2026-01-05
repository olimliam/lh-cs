import { Injectable } from '@nestjs/common';

import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class GetRoomInfoHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.GET_ROOM_INFO;

  constructor(
    private readonly consultationRoomManager: ConsultationRoomManagerService
  ) {}

  handle({ parsedData, sessionId, client }: WsEventContext) {
    if (parsedData.data?.requestAll) {
      this.consultationRoomManager.getAllRoomsInfo(client);
      return;
    }

    if (!sessionId) {
      return;
    }

    this.consultationRoomManager.getRoomInfo(sessionId, client);
  }
}
