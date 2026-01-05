import { WsEmitEventsEnum } from '@/common/enum/ws-emit-events.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WhiteboardManagerService {
  constructor(private readonly logger: Logger) {}
  private whiteboards: Map<string, Set<string>> = new Map();

  checkWhiteboardExists(sessionId: string): boolean {
    return this.whiteboards.has(sessionId);
  }

  shareCurrentWhiteboard(sessionId: string, client: Socket): any | null {
    const currentData = this.whiteboards.get(sessionId as string);
    client.to(sessionId).emit(
      WsEmitEventsEnum.MESSAGE,
      JSON.stringify({
        type: 'slideList',
        data: currentData,
      })
    );
    this.logger.log(`Sent current session data to client: ${client.id}`);
  }

  updateWhiteboard(sessionId: string, data: any): void {
    this.whiteboards.set(sessionId, data);
    this.logger.log(`Updated whiteboard data for session: ${sessionId}`);
  }
}
