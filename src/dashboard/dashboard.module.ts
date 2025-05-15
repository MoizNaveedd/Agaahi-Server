import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardChartsModel } from './entity/dashboard.entity';
import { DatabaseValidatorModule } from 'src/database-validator/database-validator.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HttpModule } from '@nestjs/axios';
import { RoleModule } from 'src/role/role.module';
import { DashboardChartsRepository } from './dashboard.repository';
import { DashboardLayoutModel } from './entity/dashboard-layout.entity';
import { DashboardlayoutRepository } from './entity/dashboard-layout.repository';
import { EmployeeModule } from 'src/employee/employee.module';
import { DashboardSharedRepository } from './dashboard-share.repository';
import { DashboardShareModel } from './entity/dashboard-share.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardChartsModel,DashboardLayoutModel,DashboardShareModel]),
    DatabaseValidatorModule,
    HttpModule,
    RoleModule,
    EmployeeModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardChartsRepository,DashboardlayoutRepository,DashboardSharedRepository],
})
export class DashboardModule {}
