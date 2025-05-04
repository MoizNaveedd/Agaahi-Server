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

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardChartsModel,DashboardLayoutModel]),
    DatabaseValidatorModule,
    HttpModule,
    RoleModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardChartsRepository,DashboardlayoutRepository],
})
export class DashboardModule {}
