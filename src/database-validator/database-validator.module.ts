import { Module } from '@nestjs/common';
import { DatabaseValidatorController } from './database-validator.controller';
import { DatabasevalidatorService } from './database-validator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionModel } from './entity/database-connection.entity';
import { DatabaseConnectionRepository } from './database-connection.repository';
import { RoleModule } from 'src/role/role.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { SharedModule } from 'src/shared/shared.module';
import { EditorService } from './editor1.service';
import { EditorHistoryRepository } from './editor.repository';
import { EditorHistoryModel } from './entity/editor-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseConnectionModel, EditorHistoryModel]), RoleModule, EmployeeModule, SharedModule],
  controllers: [DatabaseValidatorController],
  providers: [DatabasevalidatorService, DatabaseConnectionRepository, EditorService, EditorHistoryRepository],
  exports: [DatabasevalidatorService, DatabaseConnectionRepository],
})
export class DatabaseValidatorModule {}
