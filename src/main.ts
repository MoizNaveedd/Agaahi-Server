import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InitializeSwagger } from './shared/helpers/DocumentationHelper';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out properties not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
      transform: true, // Automatically transform payloads to match DTO types
    }),
  );
  app.enableCors();
  InitializeSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Agaahi Server is listening on ${port}`);
}
bootstrap();