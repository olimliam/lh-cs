import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpRelayClient } from '@/infrastructure/api-client/http-relay.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 50000,
      maxRedirects: 5,
    }),
  ],
  providers: [HttpRelayClient, Logger],
  exports: [HttpRelayClient],
})
export class HttpRelayModule {}
