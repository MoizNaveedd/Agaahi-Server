import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabasevalidatorService } from "./database-validator.service";
import { IRedisUserModel } from "src/shared/interfaces/IRedisUserModel";
import { appEnv } from "src/shared/helpers/EnvHelper";
import axios from 'axios';
import { EditorDataDto, EditorQueryDto, GetHistoryDto } from "./database-validator.dto";
import { RowDataPacket } from "mysql2";
import * as mysql from 'mysql2/promise';
import { EditorHistoryModel } from "./entity/editor-history.entity";
import { EditorHistoryRepository } from "./editor.repository";
import { assertQuerySafety } from "src/shared/helpers/QueryValidator";
import { RoleService } from "src/role/role.service";
@Injectable()
export class EditorService {
    constructor(
    //   private readonly httpService: HttpService,
      private readonly editorHistoryRepository: EditorHistoryRepository,
      private readonly roleService: RoleService,
      private readonly databaseValidatorService: DatabasevalidatorService,
    //   private readonly databaseConnectionService: DatabasevalidatorService,
    ){}

    public async GetEditorSQLQuery(user: IRedisUserModel, data: EditorQueryDto){
      let employeeRole;
      try {
        [employeeRole] = await Promise.all([
          this.roleService.GetCompanyRoleDetails(user.role_id, user.company_id),
        ]);
      } catch (error) {
        throw new BadRequestException(`Failed to fetch role details or conversation: ${error.message}`);
      }
  
      // Validate role and permissions
      if (!employeeRole) {
        throw new BadRequestException('Role not found');
      }
  
      if (!employeeRole?.table_permission || employeeRole?.table_permission?.length === 0) {
        throw new BadRequestException('Role has no table permissions configured');
      }
  
      // Prepare payload for chatbot
      const payload = {
        question: data.question,
        role: employeeRole.role.name.toLowerCase(),
        allowed_tables: employeeRole.table_permission,
      };
      
      const isSafe = assertQuerySafety(data.question);
      if (!isSafe) {
        throw new BadRequestException(
            'Invalid query detected. This endpoint only allows SELECT operations. ' +
            'Please remove any INSERT, UPDATE, DELETE, DROP, or other modification operations.'
        );
      }
        const response = await axios.post(`${appEnv('CHAT_BOT_URL')}editor/query`, payload);

        if(response?.data.format == 'html'){
          throw new BadRequestException("Access Denied!! You Don't have a permission to view such data, If you believe this is an error or require access to these resources, please contact your administrator or review your assigned role’s permissions.")
        }

        const editorHistory = new EditorHistoryModel();
        editorHistory.employee_id = user.employee_id;
        editorHistory.query = response.data;
        editorHistory.user_prompt = data.question;
        editorHistory.response = '';

        await this.editorHistoryRepository.Save(editorHistory);

        return response.data;
    }

    public async GetEditorHistory(user: IRedisUserModel,data: GetHistoryDto){
        const editorHistory = await this.editorHistoryRepository.GetHistory(user,data);
        return editorHistory;
    }

    public async GetEditorDataAndSQLQuery(user: IRedisUserModel, data: EditorQueryDto){
      let employeeRole;
      try {
        [employeeRole] = await Promise.all([
          this.roleService.GetCompanyRoleDetails(user.role_id, user.company_id),
        ]);
      } catch (error) {
        throw new BadRequestException(`Failed to fetch role details or conversation: ${error.message}`);
      }
  
      // Validate role and permissions
      if (!employeeRole) {
        throw new BadRequestException('Role not found');
      }
  
      if (!employeeRole?.table_permission || employeeRole?.table_permission?.length === 0) {
        throw new BadRequestException('Role has no table permissions configured');
      }
  
      // Prepare payload for chatbot
      const payload = {
        question: data.question,
        role: employeeRole.role.name.toLowerCase(),
        allowed_tables: employeeRole.table_permission,
      };
        
        const isSafe = assertQuerySafety(data.question);
        if (!isSafe) {
          throw new BadRequestException(
            'Invalid query detected. This endpoint only allows SELECT operations. ' +
            'Please remove any INSERT, UPDATE, DELETE, DROP, or other modification operations.'
          );
        }
        const response = await axios.post(`${appEnv('CHAT_BOT_URL')}editor/query`, payload);

        if(response?.data.format == 'html'){
          throw new BadRequestException("Access Denied!! You Don't have a permission to view such data, If you believe this is an error or require access to these resources, please contact your administrator or review your assigned role’s permissions.")
        }
        const connection = await this.getDbConnection(user);
        const query = response.data;
        const result = await this.executeDbQuery(connection, query);

        const editorHistory = new EditorHistoryModel();
        editorHistory.employee_id = user.employee_id;

        editorHistory.query = response.data;
        editorHistory.user_prompt = data.question;
        editorHistory.response = '';

        await this.editorHistoryRepository.Save(editorHistory);
        return result;
    }

    public async getDbConnection(
        user: IRedisUserModel,
      ): Promise<mysql.Connection> {
        try {
          const dbConfig =
            await this.databaseValidatorService.GetDBConnectionDetailByCompanyId(
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
    

    public async GetEditorData(user: IRedisUserModel, data: EditorDataDto){
            let employeeRole;
      try {
        [employeeRole] = await Promise.all([
          this.roleService.GetCompanyRoleDetails(user.role_id, user.company_id),
        ]);
      } catch (error) {
        throw new BadRequestException(`Failed to fetch role details or conversation: ${error.message}`);
      }
  
      // Validate role and permissions
      if (!employeeRole) {
        throw new BadRequestException('Role not found');
      }
  
      if (!employeeRole?.table_permission || employeeRole?.table_permission?.length === 0) {
        throw new BadRequestException('Role has no table permissions configured');
      }
  
      // Prepare payload for chatbot
      const payload = {
        question: data.query,
        role: employeeRole.role.name.toLowerCase(),
        allowed_tables: employeeRole.table_permission,
      };
      
      const isSafe = assertQuerySafety(data.query);
      if (!isSafe) {
        throw new BadRequestException(
            'Invalid query detected. This endpoint only allows SELECT operations. ' +
            'Please remove any INSERT, UPDATE, DELETE, DROP, or other modification operations.'
        );
      }
        const response = await axios.post(`${appEnv('CHAT_BOT_URL')}editor/query`, payload);

        if(response?.data.format == 'html'){
          throw new BadRequestException("Access Denied!! You Don't have a permission to view such data, If you believe this is an error or require access to these resources, please contact your administrator or review your assigned role’s permissions.")
        }
        const connection = await this.getDbConnection(user);
        const query = data.query;
        const result = await this.executeDbQuery(connection, query);
        return result;
    }

    // public async GetEditorDataV2(user: IRedisUserModel, data: EditorDataDto){

    // }
}