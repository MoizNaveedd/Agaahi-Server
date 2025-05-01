import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardChartsModel } from './entity/dashboard.entity';
import { DatabaseValidatorModule } from 'src/database-validator/database-validator.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HttpModule } from '@nestjs/axios';
import { RoleModule } from 'src/role/role.module';
import { DashboardChartsRepository } from './dashboard.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardChartsModel]),
    DatabaseValidatorModule,
    HttpModule,
    RoleModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardChartsRepository],
})
export class DashboardModule {}
