import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'lh-cs-be',
      version: '2.2.0',
    };
  }

  @Get('healthz')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthz() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'lh-cs-be',
      version: '2.2.0',
    };
  }
}
