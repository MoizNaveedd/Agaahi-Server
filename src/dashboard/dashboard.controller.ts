import { Body, Controller, Post } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { ChartSaveDto, CreateDashboardChartDto } from './dashboard.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Authorized()
  @Post('/generate-chart')
  async ChartChecker(
    @Body() data: CreateDashboardChartDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const chart = await this.dashboardService.GenerateChartData(data, user);
    return chart;
  }

  @Authorized()
  @Post('/save-chart')
  async SaveChart(
    @Body() data: ChartSaveDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const chart = await this.dashboardService.SaveChartData(data, user);
    return chart;
  }
}
