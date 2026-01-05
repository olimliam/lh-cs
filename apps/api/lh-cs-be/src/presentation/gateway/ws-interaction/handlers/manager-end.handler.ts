import { Injectable } from '@nestjs/common';

import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { assignClientMetadata } from './ws-client-metadata.util';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class ManagerEndHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.MANAGER_END;

  constructor(
    private readonly consultationRoomManager: ConsultationRoomManagerService
  ) {}

  handle({ parsedData, sessionId, client }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    const managerId = parsedData.userId ?? parsedData.data?.managerId;
    const consultationIdForClient =
      parsedData.data?.consultationId ?? (sessionId as string | undefined);

    if (consultationIdForClient && managerId) {
      assignClientMetadata(client, {
        consultationId: consultationIdForClient,
        userType: 'counselor',
        counselorId: managerId,
      });
    }

    this.consultationRoomManager.endConsultation(sessionId, client);
  }
}
