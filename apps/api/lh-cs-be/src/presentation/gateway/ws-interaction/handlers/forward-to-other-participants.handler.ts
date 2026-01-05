import { Injectable } from '@nestjs/common';

import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

abstract class BaseForwardToOthersHandler implements WsEventHandler {
  abstract readonly type: WsEmitEventsEnum;

  constructor(
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  handle({ sessionId, client, raw }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    this.broadcastManager.forwardToOtherParticipants(
      sessionId,
      client.id,
      message
    );
  }
}

@Injectable()
export class WebrtcOfferHandler extends BaseForwardToOthersHandler {
  readonly type = WsEmitEventsEnum.WEBRTC_OFFER;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class WebrtcAnswerHandler extends BaseForwardToOthersHandler {
  readonly type = WsEmitEventsEnum.WEBRTC_ANSWER;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class WebrtcIceCandidateHandler extends BaseForwardToOthersHandler {
  readonly type = WsEmitEventsEnum.WEBRTC_ICE_CANDIDATE;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}
