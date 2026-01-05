import { Injectable } from '@nestjs/common';

import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { assignClientMetadata } from './ws-client-metadata.util';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class CheckVisitorJoinHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.CHECK_VISITOR_JOIN;

  constructor(
    private readonly consultationRoomManager: ConsultationRoomManagerService
  ) {}

  handle({ parsedData, sessionId, client }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    this.consultationRoomManager.checkVisitorCanJoin(
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
  }
}
