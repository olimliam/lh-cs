import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import {
  createSwaggerConfig,
  swaggerCustomOptions,
  swaggerDocumentOptions,
} from '../config/swagger.config';

export function setupSwagger(app: NestExpressApplication) {
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(
    app,
    config,
    swaggerDocumentOptions
  );
  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);
}
