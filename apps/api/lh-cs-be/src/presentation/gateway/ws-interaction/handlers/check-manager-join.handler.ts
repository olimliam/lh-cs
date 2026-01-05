import { Injectable } from '@nestjs/common';

import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { assignClientMetadata } from './ws-client-metadata.util';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class CheckManagerJoinHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.CHECK_MANAGER_JOIN;

  constructor(
    private readonly consultationRoomManager: ConsultationRoomManagerService
  ) {}

  handle({ parsedData, sessionId, client }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    this.consultationRoomManager.checkManagerCanJoin(
      sessionId,
      parsedData.data.managerId,
      client
    );

    const managerId = parsedData.data?.managerId ?? parsedData.userId;
    const consultationIdForClient =
      parsedData.data?.consultationId ?? (sessionId as string | undefined);

    if (consultationIdForClient && managerId) {
      assignClientMetadata(client, {
        consultationId: consultationIdForClient,
        userType: 'counselor',
        counselorId: managerId,
      });
    }
  }
}
