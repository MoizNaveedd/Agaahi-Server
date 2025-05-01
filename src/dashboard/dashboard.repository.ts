import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardChartsModel } from './entity/dashboard.entity';

@Injectable()
export class DashboardChartsRepository extends BaseRepository<DashboardChartsModel> {
  constructor(
    @InjectRepository(DashboardChartsModel)
    private dashboardChartRepository: Repository<DashboardChartsModel>,
  ) {
    super(dashboardChartRepository);
  }
}