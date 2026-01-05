import {
  CameraFovHandler,
  CameraRotationHandler,
  DeviceInfoHandler,
  MarkerClickHandler,
  RemotePopupClosedHandler,
  PointerMoveHandler,
  RtcConnectionStateHandler,
  RtcScreenShareEndHandler,
  RtcScreenShareStartHandler,
  SceneChangeHandler,
  UserPresenceHandler,
  ViewportSyncHandler,
  ZoomShareClickHandler,
} from './simple-broadcast.handlers';
import {
  WebrtcAnswerHandler,
  WebrtcIceCandidateHandler,
  WebrtcOfferHandler,
} from './forward-to-other-participants.handler';
import { CheckManagerJoinHandler } from './check-manager-join.handler';
import { CheckVisitorJoinHandler } from './check-visitor-join.handler';
import { GetRoomInfoHandler } from './get-room-info.handler';
import { ManagerEndHandler } from './manager-end.handler';
import { ManagerReadyHandler } from './manager-ready.handler';
import { ViewSyncHandler } from './view-sync.handler';
import { VisitorEndHandler } from './visitor-end.handler';
import { VisitorReadyHandler } from './visitor-ready.handler';
import { WhiteboardUpdateHandler } from './whiteboard-update.handler';

export const WS_EVENT_HANDLERS = [
  WhiteboardUpdateHandler,
  CheckManagerJoinHandler,
  CheckVisitorJoinHandler,
  VisitorReadyHandler,
  ManagerReadyHandler,
  ManagerEndHandler,
  VisitorEndHandler,
  GetRoomInfoHandler,
  ViewSyncHandler,
  WebrtcOfferHandler,
  WebrtcAnswerHandler,
  WebrtcIceCandidateHandler,
  SceneChangeHandler,
  UserPresenceHandler,
  ViewportSyncHandler,
  CameraRotationHandler,
  CameraFovHandler,
  DeviceInfoHandler,
  PointerMoveHandler,
  MarkerClickHandler,
  RemotePopupClosedHandler,
  RtcScreenShareStartHandler,
  RtcScreenShareEndHandler,
  RtcConnectionStateHandler,
  ZoomShareClickHandler,
];

export {
  CameraFovHandler,
  CameraRotationHandler,
  CheckManagerJoinHandler,
  CheckVisitorJoinHandler,
  DeviceInfoHandler,
  GetRoomInfoHandler,
  ManagerEndHandler,
  ManagerReadyHandler,
  PointerMoveHandler,
  MarkerClickHandler,
  RemotePopupClosedHandler,
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
  ZoomShareClickHandler,
};
