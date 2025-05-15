import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardShareModel } from './entity/dashboard-share.entity';

@Injectable()
export class DashboardSharedRepository extends BaseRepository<DashboardShareModel> {
  constructor(
    @InjectRepository(DashboardShareModel)
    private dashboardShareRepository: Repository<DashboardShareModel>,
  ) {
    super(dashboardShareRepository);
  }
}