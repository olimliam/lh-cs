import { Injectable } from '@nestjs/common';

import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { assignClientMetadata } from './ws-client-metadata.util';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class VisitorEndHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.VISITOR_END;

  constructor(
    private readonly consultationRoomManager: ConsultationRoomManagerService
  ) {}

  handle({ parsedData, sessionId, client }: WsEventContext) {
    if (!sessionId) {
      return;
    }

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

    this.consultationRoomManager.exitVisitor(sessionId, client);
  }
}
