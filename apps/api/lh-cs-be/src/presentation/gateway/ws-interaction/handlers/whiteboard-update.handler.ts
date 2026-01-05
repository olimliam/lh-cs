import { Injectable, Logger } from '@nestjs/common';

import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { WhiteboardManagerService } from '@/application/service/whiteboard-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class WhiteboardUpdateHandler implements WsEventHandler {
  readonly type = WsEmitEventsEnum.WHITEBOARD_UPDATE;
  private readonly logger = new Logger(WhiteboardUpdateHandler.name);

  constructor(
    private readonly whiteboardManager: WhiteboardManagerService,
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  handle({ parsedData, sessionId, raw }: WsEventContext) {
    if (!sessionId) {
      this.logger.warn('WHITEBOARD_UPDATE received without sessionId');
      return;
    }

    this.whiteboardManager.updateWhiteboard(sessionId, parsedData.data);

    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    this.broadcastManager.sendMessageToRoom(sessionId, message);
  }
}
