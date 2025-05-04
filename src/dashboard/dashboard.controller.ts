import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { ChartSaveDto, CreateDashboardChartDto } from './dashboard.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { DashboardLayoutService, LayoutsData } from './dashboard-layout.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService,
  ) {}

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

  @Authorized()
  @Get('/dashboard-layout')
  async GetMyLayout(@CurrentUser() user: IRedisUserModel,) {
    return this.dashboardService.getLayoutsForEmployee(user.employee_id);
  }

  // @Authorized()
  // @Put()
  // async updateLayout(
  //   @CurrentUser() user: IRedisUserModel,
  //   @Body() layouts: LayoutsData,
  // ) {
  //   await this.dashboardLayoutService.saveLayout(user.employee_id, layouts);
  //   return { success: true };
  // }

  // @Authorized()
  // @Post('/chart/:chartId')
  // async AddChartToLayout(
  //   @CurrentUser() user: IRedisUserModel,
  //   @Param('chartId') chartId: number,
  //   @Body() dimensions: DimensionDto,
  // ): Promise<LayoutsData> {
  //   const { width = 8, height = 8 } = dimensions;
  //   return this.dashboardLayoutService.addChartToLayout(
  //     user.employee_id,
  //     chartId,
  //     width,
  //     height,
  //   );
  // }


}
