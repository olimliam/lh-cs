import { Injectable } from '@nestjs/common';

import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { WsEventContext, WsEventHandler } from './ws-event-handler.interface';

abstract class BaseSimpleBroadcastHandler implements WsEventHandler {
  abstract readonly type: WsEmitEventsEnum;

  constructor(
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  handle({ sessionId, raw }: WsEventContext) {
    if (!sessionId) {
      return;
    }

    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    this.broadcastManager.sendMessageToRoom(sessionId, message);
  }
}

@Injectable()
export class SceneChangeHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.SCENE_CHANGE;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class UserPresenceHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.USER_PRESENCE;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class ViewportSyncHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.VIEWPORT_SYNC;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class CameraRotationHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.CAMERA_ROTATION;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class CameraFovHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.CAMERA_FOV;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class DeviceInfoHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.DEVICE_INFO;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class RtcScreenShareStartHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.RTC_SCREEN_SHARE_START;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class RtcScreenShareEndHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.RTC_SCREEN_SHARE_END;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class RtcConnectionStateHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.RTC_CONNECTION_STATE;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class ZoomShareClickHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.ZOOM_SHARE_CLICK;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class PointerMoveHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.POINTER_MOVE;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class MarkerClickHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.MARKER_CLICK;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}

@Injectable()
export class RemotePopupClosedHandler extends BaseSimpleBroadcastHandler {
  readonly type = WsEmitEventsEnum.REMOTE_POPUP_CLOSED;

  constructor(broadcastManager: BroadcastManagerService) {
    super(broadcastManager);
  }
}
