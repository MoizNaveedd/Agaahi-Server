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
  ChartSaveDto,
  CreateDashboardChartDto,
} from './dashboard.dto';
import { appEnv } from 'src/shared/helpers/EnvHelper';
import { RoleService } from 'src/role/role.service';
import { DashboardChartsModel } from './entity/dashboard.entity';
import { DashboardChartsRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  private dbPool: Pool;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly databaseConnectionService: DatabasevalidatorService,
    private readonly roleService: RoleService,
    private readonly dashboardChartsRepository: DashboardChartsRepository,
  ) {}

  public async GenerateChartData(
    data: CreateDashboardChartDto,
    user: IRedisUserModel,
  ): Promise<any> {
    try {
      const employeeRole = await this.roleService.GetCompanyRoleDetails(
        user.role_id,
        user,
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

  public async SaveChartData(data: ChartSaveDto, user: IRedisUserModel) {
    const dashboard = new DashboardChartsModel();
    dashboard.chart_id = data.chart_id;
    dashboard.sql_query = data.sql_query;
    dashboard.x_axis = data.x_axis;
    dashboard.y_axis = JSON.stringify(data.y_axis);
    dashboard.meta_info = JSON.stringify(data);
    dashboard.employee_id = user.employee_id;
    dashboard.meta_info = JSON.stringify(data);

    return await this.dashboardChartsRepository.Save(dashboard);
  }

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
  ): Promise<any[]> {
    try {
      const [rows] = await connection.query<RowDataPacket[]>(query);
      await connection.end(); // close connection after query
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
}
