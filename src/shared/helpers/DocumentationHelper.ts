import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function InitializeSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Agaahi API Documentation')
    .setVersion('0.1')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      description: 'Api authentication token',
      name: 'AUTHORIZATION',
      in: 'header',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return methodKey.replace(/([A-Z])/g, ' $1').trim();
    },
  });
  SwaggerModule.setup('/api-docs', app, document);
}