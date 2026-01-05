import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WsInteractionGateway } from '@/presentation/gateway/ws-interaction/ws-interaction.gateway';
import { ConsultationRoomManagerService } from '@/application/service/consultation-room-manager.service';
import { LhApiClientService } from '@/application/service/consultation-api-client.service';
import { BroadcastManagerService } from '@/application/service/broadcast-manager.service';
import { ConsultationModule } from './consultation.module';
import { WhiteboardManagerService } from '@/application/service/whiteboard-manager.service';
import { LoggerModule } from './logger.module';
import { StatisticsModule } from './statistics.module';
import { WS_EVENT_HANDLERS } from '@/presentation/gateway/ws-interaction/handlers';
import { WsEventHandlerRegistry } from '@/presentation/gateway/ws-interaction/handlers/ws-event-handler.registry';
@Module({
  imports: [
    HttpModule,
    forwardRef(() => ConsultationModule),
    forwardRef(() => LoggerModule),
    StatisticsModule,
  ],
  providers: [
    WsInteractionGateway,
    WsEventHandlerRegistry,
    ...WS_EVENT_HANDLERS,
    ConsultationRoomManagerService,
    LhApiClientService,
    BroadcastManagerService,
    WhiteboardManagerService,
  ],
  exports: [
    WsInteractionGateway,
    WsEventHandlerRegistry,
    ConsultationRoomManagerService,
    LhApiClientService,
    BroadcastManagerService,
    WhiteboardManagerService,
  ],
})
export class WebSocketModule {}
