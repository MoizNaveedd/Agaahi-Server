import { Module } from '@nestjs/common';
import { DatabaseValidatorController } from './database-validator.controller';
import { DatabasevalidatorService } from './database-validator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionModel } from './entity/database-connection.entity';
import { DatabaseConnectionRepository } from './database-connection.repository';
import { RoleModule } from 'src/role/role.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseConnectionModel]), RoleModule, EmployeeModule, SharedModule],
  controllers: [DatabaseValidatorController],
  providers: [DatabasevalidatorService, DatabaseConnectionRepository],
  exports: [DatabasevalidatorService, DatabaseConnectionRepository],
})
export class DatabaseValidatorModule {}
