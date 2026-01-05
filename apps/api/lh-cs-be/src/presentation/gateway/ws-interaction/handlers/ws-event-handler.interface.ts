import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { Socket } from 'socket.io';

export interface WsEventContext {
  parsedData: any;
  raw: any;
  client: Socket;
  sessionId?: string;
}

export interface WsEventHandler {
  readonly type: WsEmitEventsEnum;
  handle(ctx: WsEventContext): Promise<void> | void;
}
