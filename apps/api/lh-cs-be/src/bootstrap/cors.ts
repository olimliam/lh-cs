import type { NestExpressApplication } from '@nestjs/platform-express';

export function setupCors(app: NestExpressApplication) {
  app.enableCors({
    origin:
      process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [
        'http://localhost:8888',
      ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-target-url',
      'Cookie',
      'x-token-id',
      'content-type',
      'x-csrf-token',
      'x-request-id',
      'x-b3-traceid',
      'X-Request-ID',
      'X-B3-TraceId',
    ],
    exposedHeaders: 'Content-Disposition,Set-Cookie,X-Request-ID,X-B3-TraceId',
    optionsSuccessStatus: 200,
  });
}
