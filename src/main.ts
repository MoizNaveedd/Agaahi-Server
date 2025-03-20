import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InitializeSwagger } from './shared/helpers/DocumentationHelper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  InitializeSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Agaahi Server is listening on ${port}`);
}
bootstrap();