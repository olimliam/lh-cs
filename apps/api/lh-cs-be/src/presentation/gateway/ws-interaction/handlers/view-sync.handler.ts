import { Injectable, Logger } from '@nestjs/common';

import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { StatisticsService } from '@/application/service/statistics.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class ViewSyncHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.VIEW_SYNC;
  private readonly logger = new Logger(ViewSyncHandler.name);

  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  async handle({ parsedData, sessionId, client, raw }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    try {
      const actionType = parsedData.data.isDrawingMode
        ? ConsultationLogActionTypeEnum.DRAWING_MODE_START
        : ConsultationLogActionTypeEnum.DRAWING_MODE_END;

      await this.statisticsService.createConsultationLog({
        actionType: actionType,
        actionValue: parsedData.data.sceneId || null,
        consultationId: parsedData.data.consultationId,
        counselorId: parsedData.userId,
        device: client.handshake.headers['user-agent'] as string,
        ipAddress: client.handshake.address,
      });
    } catch (error) {
      this.logger.error('Failed to log drawing mode change:', error);
    }

    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    this.broadcastManager.sendMessageToRoom(sessionId, message);
  }
}
