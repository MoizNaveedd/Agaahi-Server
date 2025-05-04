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
} from './dashboard.dto';
import { appEnv } from 'src/shared/helpers/EnvHelper';
import { RoleService } from 'src/role/role.service';
import { DashboardChartsModel } from './entity/dashboard.entity';
import { DashboardChartsRepository } from './dashboard.repository';
import { DashboardlayoutRepository } from './entity/dashboard-layout.repository';
import { DashboardLayoutModel } from './entity/dashboard-layout.entity';

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
      throw new Error('Failed to generate chart data');
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
    const apiUrl = `${appEnv('CHAT_BOT_URL')}dashboard`;
    const response = await firstValueFrom(
      this.httpService.post(apiUrl, {
        user_prompt: userPrompt,
        chart_id: +chartId,
        role: role,
      }),
    );
    return response.data;
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
      throw new Error(`Database query failed: ${error.message}`);
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

    // Now save the layout for this chart
    const defaultWidth = 8;
    const defaultHeight = 8;
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

  public async GetDashboardDataForEmployee(user: IRedisUserModel) {
    const layouts = await this.dashboardLayoutRepository.GetLayoutByEmployeeId(user.employee_id);
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
      throw err;
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
}
