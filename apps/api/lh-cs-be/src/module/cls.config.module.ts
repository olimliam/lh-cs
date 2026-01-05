import {
  getTraceIdHeader,
  REQUEST_ID_HEADER,
  resolveRequestId,
  storeRequestId,
} from '@/common/utils/request-id.util';
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import type { Request, Response } from 'express';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => resolveRequestId(req),
        setup: (cls, req: Request, res: Response) => {
          const requestId = cls.getId() ?? resolveRequestId(req);
          const traceId = getTraceIdHeader(req) ?? requestId;
          storeRequestId(req, requestId);
          cls.set('requestId', requestId);
          cls.set('traceId', traceId);
          req.headers[REQUEST_ID_HEADER] = requestId;
          if (res?.setHeader) {
            res.setHeader(REQUEST_ID_HEADER, requestId);
            res.setHeader('X-B3-TraceId', traceId);
          }
        },
      },
    }),
  ],
})
export class ClsConfigModule {}
