import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env['DB_POSTGRES_HOST'],
  port: +process.env['DB_POSTGRES_PORT'],
  database: process.env['DB_POSTGRES_DB_NAME'],
  username: process.env['DB_POSTGRES_USER'],
  password: process.env['DB_POSTGRES_PASS'],
  entities: [path.join(__dirname, '..', '..', '/**/entity/*.entity.js')],
  synchronize: false,
  logging: ['error', 'schema','query'],
  retryAttempts: 1,
  migrations: [
    path.join(__dirname, '..', '..', '/shared/database/migration/*.js'),
  ],
  migrationsRun: false,
  ssl: {
    rejectUnauthorized: false, // Disables certificate validation
  },};
