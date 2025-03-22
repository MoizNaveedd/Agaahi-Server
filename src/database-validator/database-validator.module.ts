import { Module } from '@nestjs/common';
import { DatabaseValidatorController } from './database-validator.controller';
import { DatabasevalidatorService } from './database-validator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionModel } from './entity/database-connection.entity';
import { DatabaseConnectionRepository } from './database-connection.repository';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseConnectionModel]), RoleModule],
  controllers: [DatabaseValidatorController],
  providers: [DatabasevalidatorService, DatabaseConnectionRepository]
})
export class DatabaseValidatorModule {}
