import { Injectable } from "@nestjs/common";
import { DatabasevalidatorService } from "./database-validator.service";
import { IRedisUserModel } from "src/shared/interfaces/IRedisUserModel";
import { appEnv } from "src/shared/helpers/EnvHelper";
import axios from 'axios';
import { EditorDataDto, EditorQueryDto } from "./database-validator.dto";
import { RowDataPacket } from "mysql2";
import * as mysql from 'mysql2/promise';

@Injectable()
export class EditorService {
    constructor(
    //   private readonly httpService: HttpService,
      private readonly databaseValidatorService: DatabasevalidatorService,
    //   private readonly databaseConnectionService: DatabasevalidatorService,
    ){}

    public async GetEditorSQLQuery(user: IRedisUserModel, data: EditorQueryDto){
        const response = await axios.post(`${appEnv('CHAT_BOT_URL')}editor/query`, { question : data.question });
        return response.data;
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
        const connection = await this.getDbConnection(user);
        const query = data.query;
        const result = await this.executeDbQuery(connection, query);
        return result;
    }
}