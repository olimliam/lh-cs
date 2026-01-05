import { Injectable } from '@nestjs/common';

import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { assignClientMetadata } from './ws-client-metadata.util';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class VisitorReadyHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.VISITOR_READY;

  constructor(
    private readonly consultationRoomManager: ConsultationRoomManagerService,
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  handle({ parsedData, sessionId, client, raw }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    this.consultationRoomManager.setVisitorReadyState(
      sessionId,
      parsedData.data.visitorId,
      client
    );

    const visitorId = parsedData.data?.visitorId ?? parsedData.userId;
    const consultationIdForClient =
      parsedData.data?.consultationId ?? (sessionId as string | undefined);

    if (consultationIdForClient && visitorId) {
      assignClientMetadata(client, {
        consultationId: consultationIdForClient,
        userType: 'visitor',
        visitorId,
      });
    }

    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    this.broadcastManager.sendMessageToRoom(sessionId, message);
  }
}
