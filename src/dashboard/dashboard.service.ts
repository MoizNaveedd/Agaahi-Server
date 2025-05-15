import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  createConnection,
  createPool,
  Pool,
  RowDataPacket,
} from 'mysql2/promise';
import * as mysql from 'mysql2/promise';
import { firstValueFrom } from 'rxjs';
import { DatabasevalidatorService } from 'src/database-validator/database-validator.service';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import {
  ChartAnalysisResponse,
  // ChartSaveDto,
  CreateDashboardChartDto,
  dashboardDTo,
  DashboardShareDto,
  LayoutArrayDto,
} from './dashboard.dto';
import { appEnv } from 'src/shared/helpers/EnvHelper';
import { RoleService } from 'src/role/role.service';
import { DashboardChartsModel } from './entity/dashboard.entity';
import { DashboardChartsRepository } from './dashboard.repository';
import { DashboardlayoutRepository } from './entity/dashboard-layout.repository';
import { DashboardLayoutModel } from './entity/dashboard-layout.entity';
import { DashboardShareModel } from './entity/dashboard-share.entity';
import { DashboardSharedRepository } from './dashboard-share.repository';
import { EmployeeRepository } from 'src/employee/repository/employee.repository';

interface ChartSaveDto {
  chart_id: number;
  sql_query: string;
  x_axis: string;
  y_axis: any[];
  // Add other properties as needed
}

export interface LayoutDto {
  breakpoint?: string;
  width: number;
  height: number;
  position_x: number;
  position_y: number;
  is_static: boolean;
  grid_i: number;
}

@Injectable()
export class DashboardService {
  private dbPool: Pool;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly databaseConnectionService: DatabasevalidatorService,
    private readonly roleService: RoleService,
    private readonly dashboardChartsRepository: DashboardChartsRepository,
    private readonly dashboardLayoutRepository: DashboardlayoutRepository,
    private readonly dashboardShareRepository: DashboardSharedRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  public async GenerateChartData(
    data: CreateDashboardChartDto,
    user: IRedisUserModel,
  ): Promise<any> {
    try {
      const employeeRole = await this.roleService.GetCompanyRoleDetails(
        user.role_id,
        user.company_id,
      );

      // Step 1: Call external API with user prompt and chart ID
      const apiResponse: ChartAnalysisResponse = await this.callExternalApi(
        data.user_prompt,
        data.chart_id,
        employeeRole.role.name.toLowerCase(),
      );

      if (!apiResponse) {
        throw new BadRequestException(
          'Not able to generate chart data, Try Again',
        );
      }

      // Step 2: Get a database connection for this company
      const dbConnection = await this.getDbConnection(user);

      // Step 3: Execute the database query
      const queryResult = await this.executeDbQuery(
        dbConnection,
        apiResponse.sql_query,
      );

      if (!queryResult || queryResult.length == 0) {
        throw new BadRequestException('No data found for the given query');
      }

      //  Step 4: Format response for frontend
      const formattedResponse = this.formatChartResponse(
        queryResult,
        apiResponse.column_mapping.x_axis || '',
        apiResponse.column_mapping.y_axis || [],
        apiResponse.sql_query,
        {
          chartId: data.chart_id,
          title: apiResponse.chart_title,
          description: apiResponse.description,
        },
      );

      return formattedResponse;
    } catch (error) {
      console.error('Error generating chart data:', error);
      
      // If it's already a BadRequestException, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // For all other errors, throw a BadRequestException with a user-friendly message
      throw new BadRequestException(
        'An error occurred while generating the chart. Please try again later.'
      );
    }
  }

  // public async SaveChartData(data: ChartSaveDto, user: IRedisUserModel) {
  //   const dashboard = new DashboardChartsModel();
  //   dashboard.chart_id = data.chart_id;
  //   dashboard.sql_query = data.sql_query;
  //   dashboard.x_axis = data.x_axis;
  //   dashboard.y_axis = JSON.stringify(data.y_axis);
  //   dashboard.meta_info = JSON.stringify(data);
  //   dashboard.employee_id = user.employee_id;
  //   dashboard.meta_info = JSON.stringify(data);

  //   return await this.dashboardChartsRepository.Save(dashboard);
  // }

  private async callExternalApi(
    userPrompt: string,
    chartId: number,
    role: string,
  ): Promise<ChartAnalysisResponse> {
    try {
      const apiUrl = `${appEnv('CHAT_BOT_URL')}dashboard`;
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, {
          user_prompt: userPrompt,
          chart_id: +chartId,
          role: role,
        }),
      );

      if (!response?.data) {
        throw new BadRequestException('Invalid response from dashboard service');
      }

      return response.data;
    } catch (error) {
      console.error('Dashboard API error:', error?.message || error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to process dashboard request. Please try again later.'
      );
    }
  }

  private async getDbConnection(
    user: IRedisUserModel,
  ): Promise<mysql.Connection> {
    try {
      const dbConfig =
        await this.databaseConnectionService.GetDBConnectionDetailByCompanyId(
          user,
        );
      const connectionConfig: any = {
        host: dbConfig.host,
        user: dbConfig.user,
        port: dbConfig.port,
        password: dbConfig.password,
        database: dbConfig.database,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 15000,
      };
      const connection = await mysql.createConnection(connectionConfig);
      console.log('Successfully connected to the database');
      return connection;
    } catch (error) {
      console.error('Failed to connect to the database:', error.message);
      throw new Error('Database connection failed');
    }
  }

  private async executeDbQuery(
    connection: mysql.Connection,
    query: string,
    con_end: boolean = true,
  ): Promise<any[]> {
    try {
      const [rows] = await connection.query<RowDataPacket[]>(query);
      if (con_end) {
        await connection.end(); // close connection after query
      }
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw new BadRequestException(`Database query failed: ${error.message}`);
    }
  }

  private formatChartResponse(
    data: any[],
    xAxis: string,
    yAxis: string[] | string,
    sql_query: string,
    additionalParams: any,
  ): any {
    const formattedData = {
      chartId: additionalParams.chartId || '',
      xAxisKey: xAxis,
      yAxisKeys: Array.isArray(yAxis) ? yAxis : [yAxis],
      sql_query: sql_query,
      data: data.map((row) => {
        const dataPoint: any = {
          [xAxis]: row[xAxis],
        };
        if (Array.isArray(yAxis)) {
          yAxis.forEach((y) => {
            dataPoint[y] = row[y];
          });
        } else {
          dataPoint[yAxis] = row[yAxis];
        }
        return dataPoint;
      }),
      metadata: {
        title: additionalParams.title || '',
        description: additionalParams.description || '',
        lastUpdated: new Date().toISOString(),
      },
    };
    return formattedData;
  }



  async SaveChartData(data: ChartSaveDto, user: IRedisUserModel) {
    const dashboard = new DashboardChartsModel();
    dashboard.chart_id = data.chart_id;
    dashboard.sql_query = data.sql_query;
    dashboard.x_axis = data.x_axis;
    dashboard.y_axis = JSON.stringify(data.y_axis);
    dashboard.meta_info = JSON.stringify(data);
    dashboard.employee_id = user.employee_id;

    // Save the chart data
    const savedChart = await this.dashboardChartsRepository.Save(dashboard);
// 5 or 3
    // Now save the layout for this chart
    const defaultWidth = data.chart_id == 11 ? 5 : 6;
    const defaultHeight = data.chart_id == 11 ? 3 : 4;
    await this.SaveChartLayout(
      savedChart.id,
      user.employee_id,
      defaultWidth,
      defaultHeight,
    );

    return savedChart;
  }

  async SaveChartLayout(
    chartId: number,
    employeeId: number,
    width: number,
    height: number,
  ) {
    // Fetch all existing layouts for this employee
    const existingLayouts = await this.dashboardLayoutRepository.Find({
      employee_id: employeeId,
      breakpoint: 'lg',
    });

    // Convert to format similar to defaultLayouts
    const layouts = existingLayouts.map((layout) => ({
      w: layout.width,
      h: layout.height,
      x: layout.position_x,
      y: layout.position_y,
      i: layout.chart_id.toString(),
      static: layout.is_static,
    }));

    const nextLayoutId = layouts.length.toString();

    // Get the new layout position
    const newLayout = this.getNewGraphLayout(
      layouts,
      nextLayoutId,
      width,
      height,
    );

    // Save the new layout to database
    const dashboardLayout = new DashboardLayoutModel();
    dashboardLayout.breakpoint = 'lg'; // Default breakpoint
    dashboardLayout.width = newLayout.w;
    dashboardLayout.height = newLayout.h;
    dashboardLayout.position_x = newLayout.x;
    dashboardLayout.position_y = newLayout.y;
    dashboardLayout.is_static = newLayout.static;
    dashboardLayout.employee_id = employeeId;
    dashboardLayout.grid_i = newLayout.i;
    dashboardLayout.chart_id = chartId;

    return await this.dashboardLayoutRepository.Save(dashboardLayout);
  }

  private getNewGraphLayout(
    layouts: any[],
    graphId: string,
    width: number,
    height: number,
  ) {
    const maxY = layouts.reduce(
      (max, layout) => Math.max(max, layout.y + layout.h),
      0,
    );
    return { w: width, h: height, x: 0, y: maxY, i: +graphId, static: false };
  }

  // Additional helper methods to get and update layouts
  public async getLayoutsForEmployee(
    employeeId: number,
    breakpoint: string = 'lg',
  ) {
    const layouts =
      await this.dashboardLayoutRepository.GetLayoutByEmployeeId(employeeId);

    return layouts;
  }

  public async DashboardShare(data: DashboardShareDto, user: IRedisUserModel) {
    const employee = await this.employeeRepository.FindOne({id: data.shared_with , company_id: user.company_id})

    if(!employee){
      throw new BadRequestException('Employee not found');
    }

    const dashboardShare = new DashboardShareModel();
    dashboardShare.dashboard_owner_id = user.employee_id;
    dashboardShare.shared_with = data.shared_with;

    return await this.dashboardShareRepository.Save(dashboardShare);
  }

  public async GetEmployeeDashboardShareWithMe(user: IRedisUserModel) {
    const dashboardShare = await this.dashboardShareRepository.Find({shared_with: user.employee_id}, null, ['employee'])

    return dashboardShare;
  }

  public async GetDashboardDataForEmployee(user: IRedisUserModel, data: dashboardDTo) {
    
    const layouts = await this.dashboardLayoutRepository.GetLayoutByEmployeeId(data.dashboard_owner_id ?? user.employee_id);
    const connection = await this.getDbConnection(user);
  
    try {
      for (const layout of layouts) {
        const chart = layout.chart;
  
        const yAxis = typeof chart.y_axis === 'string' ? JSON.parse(chart.y_axis) : chart.y_axis;
        const metaInfo = typeof chart.meta_info === 'string' ? JSON.parse(chart.meta_info) : {};
        const xAxis = chart.x_axis;
        const sqlQuery = chart.sql_query;
  
        const rows = await this.executeDbQuery(connection, sqlQuery, false);
  
        const formatted = this.formatChartResponse(
          rows,
          xAxis,
          yAxis,
          sqlQuery,
          {
            chartId: chart.chart_id,
            title: metaInfo?.title || `Chart ${chart.chart_id}`,
            description: metaInfo?.description || '',
          }
        );
  
        // Add formatted data inside each layout
        layout.data = formatted.data;
      }
  
      return layouts;
    } catch (err) {
      console.error('Error while getting dashboard data:', err);
      throw new BadRequestException('Error while getting dashboard data');
    } finally {
      await connection.end();
    }
  }
  
  

  public async DeleteChart(
    layoutId: number,
    employeeId: number,
  ): Promise<boolean> {
    const layput = await this.dashboardLayoutRepository.FindOne({
      employee_id: employeeId,
      id: layoutId,
    });

    if (!layput) {
      throw new BadRequestException('Layout not found');
    }

    const [result] = await Promise.all([
      this.dashboardLayoutRepository.Delete(
        {
          employee_id: employeeId,
          id: layoutId,
        },
        true,
      ),
      this.dashboardChartsRepository.Delete(
        {
          employee_id: employeeId,
          id: layput.chart_id,
        },
        true,
      ),
    ]);

    // Check if the deletion was successful
    if (result.affected == 0) {
      throw new BadRequestException('Layout not found or deletion failed');
    }

    return true;
  }

  public async updateLayoutById(
    employeeId: number,
    layoutId: number,
    layout: LayoutDto,
  ): Promise<boolean> {
    // Update the layout with the given layout ID
    const result = await this.dashboardLayoutRepository.Update(
      { employee_id: employeeId, id: layoutId }, // Match by employee ID and layout ID
      {
        width: layout.width,
        height: layout.height,
        position_x: layout.position_x,
        position_y: layout.position_y,
        is_static: layout.is_static,
        grid_i: layout.grid_i,
        breakpoint: layout.breakpoint || 'lg',
      },
    );
  
    // Check if the update was successful
    if (result.affected == 0) {
      throw new BadRequestException('Layout not found or update failed');
    }
  
    return true;
  }
  public async updateAllLayoutsForEmployee(
    employeeId: number,
    layoutDtos: LayoutArrayDto,
  ): Promise<DashboardLayoutModel[]> {
    // Step 1: Fetch existing layouts with related charts
    const existingLayouts = await this.dashboardLayoutRepository.Find(
      { employee_id: employeeId },
      null,
      ['chart']
    );
  
    // Step 2: Delete existing charts and layouts
    for (const layout of existingLayouts) {
      if (layout.chart?.id) {
        await this.dashboardChartsRepository.Delete(layout.chart.id, true);
      }
      await this.dashboardLayoutRepository.Delete(layout.id, true);
    }
  
    // Step 3: Normalize DTO input
    const normalizedDtos = layoutDtos.layouts || [];
    const savedLayouts: DashboardLayoutModel[] = [];
  // console.log(normalizedDtos[0])
    for (const dto of normalizedDtos) {
      // Create ChartModel using `new`
      const chart = new DashboardChartsModel();
      chart.x_axis = dto.chart.x_axis;
      chart.y_axis = dto.chart.y_axis;
      chart.sql_query = dto.chart.sql_query;
      chart.meta_info = dto.chart.meta_info;
      chart.chart_id = dto.chart.chart_id;
      chart.employee_id = employeeId;
  
      const savedChart = await this.dashboardChartsRepository.Save(chart);
  
      // Create LayoutModel using `new`
      const layout = new DashboardLayoutModel();
      layout.width = dto.width;
      layout.height = dto.height;
      layout.position_x = dto.position_x;
      layout.position_y = dto.position_y;
      layout.is_static = dto.is_static;
      layout.grid_i = dto.grid_i;
      layout.breakpoint = dto.breakpoint || 'lg';
      layout.employee_id = employeeId;
      layout.chart_id = savedChart.id;
  
      const savedLayout = await this.dashboardLayoutRepository.Save(layout);
  
      // Attach chart to layout for return
      savedLayout.chart = savedChart;
      savedLayouts.push(savedLayout);
    }
  
    return savedLayouts;
  }
  
}
