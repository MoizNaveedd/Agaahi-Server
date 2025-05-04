import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardLayoutModel } from './dashboard-layout.entity';

@Injectable()
export class DashboardlayoutRepository extends BaseRepository<DashboardLayoutModel> {
  constructor(
    @InjectRepository(DashboardLayoutModel)
    private dashboardlayoutRepository: Repository<DashboardLayoutModel>,
  ) {
    super(dashboardlayoutRepository);
  }

  public async GetLayoutByEmployeeId(
    employeeId: number,
  ): Promise<DashboardLayoutModel[]> {
    const query = this.dashboardlayoutRepository
      .createQueryBuilder('dashboard_layout')
      .select([
        'dashboard_layout.id',
        'dashboard_layout.breakpoint',
        'dashboard_layout.width',
        'dashboard_layout.height',
        'dashboard_layout.grid_i',
        'dashboard_layout.position_x',
        'dashboard_layout.position_y',
        'dashboard_layout.is_static',
        'dashboard_layout.employee_id',
        'dashboard_layout.chart_id',
        'chart.id',
        'chart.x_axis',
        'chart.y_axis',
        'chart.meta_info',
        'chart.sql_query',
        'chart.chart_id',
      ])
      .leftJoin('dashboard_layout.chart', 'chart')

      .where('dashboard_layout.employee_id = :employeeId', { employeeId })
      .andWhere('dashboard_layout.is_deleted = 0')
      .orderBy('dashboard_layout.grid_i', 'ASC');

    const result = await query.getMany();
    return result
  }
}
