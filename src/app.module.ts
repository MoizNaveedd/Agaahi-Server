import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig } from './shared/database/postgres.config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseValidatorModule } from './database-validator/database-validator.module';
import { RequestLoggingMiddleware } from './shared/middlewares/request-logging.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(postgresConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CompanyModule,
    ChatbotModule,
    DatabaseValidatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}