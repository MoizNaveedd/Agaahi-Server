import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig } from './shared/database/postgres.config';
import { ConfigModule } from '@nestjs/config';
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
    ChatbotModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
