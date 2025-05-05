import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { ChartSaveDto, CreateDashboardChartDto, LayoutArrayDto, LayoutDto } from './dashboard.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';

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

  @Authorized()
  @Get('/dashboard-data')
  async GetDashboardData(@CurrentUser() user: IRedisUserModel,) {
    return this.dashboardService.GetDashboardDataForEmployee(user);
  }

  @Authorized()
  @Put('/dashboard-layout')
  async updateLayout(
    @CurrentUser() user: IRedisUserModel,
    @Body() data: LayoutArrayDto,
  ) {
    return await this.dashboardService.updateAllLayoutsForEmployee(user.employee_id,data);
  }

  @Authorized()
  @Delete('/dashboard-layout/:layoutId')
  async deleteLayout(
    @CurrentUser() user: IRedisUserModel,
    @Param('layoutId') layoutId: number,
  ) {
    await this.dashboardService.DeleteChart(layoutId,user.employee_id);
    return { success: true };
  }

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
