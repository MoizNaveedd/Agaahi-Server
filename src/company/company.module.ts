import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from './company.repository';
import { CompanyModel } from './entity/company.entity';
import { EmployeeModule } from 'src/employee/employee.module';
import { CompanyAdminController } from './company-admin.controller';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyModel]),
  EmployeeModule,
  AdminModule,
],
  controllers: [CompanyController, CompanyAdminController],
  providers: [CompanyService, CompanyRepository],
})
export class CompanyModule {}