import { Injectable, Logger } from '@nestjs/common';

import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import {
  CameraFovHandler,
  CameraRotationHandler,
  CheckManagerJoinHandler,
  CheckVisitorJoinHandler,
  DeviceInfoHandler,
  MarkerClickHandler,
  RemotePopupClosedHandler,
  GetRoomInfoHandler,
  ManagerEndHandler,
  ManagerReadyHandler,
  RtcConnectionStateHandler,
  RtcScreenShareEndHandler,
  RtcScreenShareStartHandler,
  SceneChangeHandler,
  UserPresenceHandler,
  ViewSyncHandler,
  ViewportSyncHandler,
  VisitorEndHandler,
  VisitorReadyHandler,
  WebrtcAnswerHandler,
  WebrtcIceCandidateHandler,
  WebrtcOfferHandler,
  WhiteboardUpdateHandler,
  PointerMoveHandler,
  ZoomShareClickHandler,
} from './index';
import { WsEventHandler } from './ws-event-handler.interface';

@Injectable()
export class WsEventHandlerRegistry {
  private readonly logger = new Logger(WsEventHandlerRegistry.name);
  private readonly handlers = new Map<WsEmitEventsEnum, WsEventHandler>();

  constructor(
    whiteboardUpdateHandler: WhiteboardUpdateHandler,
    checkManagerJoinHandler: CheckManagerJoinHandler,
    checkVisitorJoinHandler: CheckVisitorJoinHandler,
    visitorReadyHandler: VisitorReadyHandler,
    managerReadyHandler: ManagerReadyHandler,
    managerEndHandler: ManagerEndHandler,
    visitorEndHandler: VisitorEndHandler,
    getRoomInfoHandler: GetRoomInfoHandler,
    viewSyncHandler: ViewSyncHandler,
    webrtcOfferHandler: WebrtcOfferHandler,
    webrtcAnswerHandler: WebrtcAnswerHandler,
    webrtcIceCandidateHandler: WebrtcIceCandidateHandler,
    sceneChangeHandler: SceneChangeHandler,
    userPresenceHandler: UserPresenceHandler,
    viewportSyncHandler: ViewportSyncHandler,
    cameraRotationHandler: CameraRotationHandler,
    cameraFovHandler: CameraFovHandler,
    deviceInfoHandler: DeviceInfoHandler,
    rtcScreenShareStartHandler: RtcScreenShareStartHandler,
    rtcScreenShareEndHandler: RtcScreenShareEndHandler,
    rtcConnectionStateHandler: RtcConnectionStateHandler,
    zoomShareClickHandler: ZoomShareClickHandler,
    markerClickHandler: MarkerClickHandler,
    remotePopupClosedHandler: RemotePopupClosedHandler,
    pointerMoveHandler: PointerMoveHandler
  ) {
    [
      whiteboardUpdateHandler,
      checkManagerJoinHandler,
      checkVisitorJoinHandler,
      visitorReadyHandler,
      managerReadyHandler,
      managerEndHandler,
      visitorEndHandler,
      getRoomInfoHandler,
      viewSyncHandler,
      webrtcOfferHandler,
      webrtcAnswerHandler,
      webrtcIceCandidateHandler,
      sceneChangeHandler,
      userPresenceHandler,
      viewportSyncHandler,
      cameraRotationHandler,
      cameraFovHandler,
      deviceInfoHandler,
      rtcScreenShareStartHandler,
      rtcScreenShareEndHandler,
      rtcConnectionStateHandler,
      zoomShareClickHandler,
      markerClickHandler,
      remotePopupClosedHandler,
      pointerMoveHandler,
    ].forEach((handler) => this.register(handler));
  }

  register(handler: WsEventHandler) {
    if (this.handlers.has(handler.type)) {
      this.logger.warn(`Handler for ${handler.type} already registered`);
      return;
    }

    this.handlers.set(handler.type, handler);
  }

  get(type: WsEmitEventsEnum): WsEventHandler | undefined {
    return this.handlers.get(type);
  }
}
