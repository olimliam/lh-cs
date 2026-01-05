import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  PrometheusModule,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { PrometheusHttpInterceptor } from '@/common/interceptor/prometheus-http.interceptor';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: { prefix: 'lh_cs_be_' },
      },
    }),
  ],
  providers: [
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusHttpInterceptor,
    },
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}
