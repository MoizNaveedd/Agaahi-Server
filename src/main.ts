import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import InitializeSwagger from './shared/helpers/DocumentationHelper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  InitializeSwagger(app)
  await app.listen(port);
  console.log(`Agaahi Server is listening on ${port}`);
}
bootstrap();