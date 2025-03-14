import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig } from './shared/database/postgres.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(postgresConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CompanyModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
