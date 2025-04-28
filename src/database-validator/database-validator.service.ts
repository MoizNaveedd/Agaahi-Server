import { BadRequestException, Injectable } from '@nestjs/common';
// import { DatabaseConnectionDto, DatabaseType } from './dto/database.dto';
import * as mysql from 'mysql2/promise';
import { Client as PostgresClient } from 'pg';
import { DatabaseConnectionDto, DatabaseType } from './database-validator.dto';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { RoleService } from 'src/role/role.service';
import { CompanyRoleModel } from 'src/role/entity/company-role.entity';
import Role from 'src/shared/enums/role-ims.enum';
import { DatabaseConnectionModel } from './entity/database-connection.entity';
import { DatabaseConnectionRepository } from './database-connection.repository';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class DatabasevalidatorService {
  constructor(private roleService: RoleService,
    private databaseConnectionRepository: DatabaseConnectionRepository,
    private employeeService: EmployeeService, // Assuming you have an EmployeeService to handle employee-related operations 
  ) {}

  async createDatabaseConnection(connectionDetails: DatabaseConnectionDto) {
    if (connectionDetails.type === DatabaseType.POSTGRES) {
      const client = new PostgresClient({
        host: connectionDetails.host,
        port: connectionDetails.port,
        user: connectionDetails.user,
        password: connectionDetails.password,
        database: connectionDetails.database,
        ssl: { rejectUnauthorized: false }, // Only connection throgh SSL are allowed
      });
      await client.connect();
      return client;
    } else if (connectionDetails.type === DatabaseType.MYSQL) {
      const client = mysql.createConnection({
        host: connectionDetails.host,
        port: connectionDetails.port,
        user: connectionDetails.user,
        password: connectionDetails.password,
        database: connectionDetails.database,
        debug: false,
      });
      return client;
    } else {
      throw new BadRequestException('Unsupported database type');
    }
  }

  async verifyDatabaseConnection(
    connectionDetails: DatabaseConnectionDto,
  ): Promise<boolean> {
    try {
      const client = await this.createDatabaseConnection(connectionDetails);
      console.log('Connection successful');
      await client.end();
      return true;
    } catch (error) {
      throw new BadRequestException(
        'Error connecting to database:',
        error.message,
      );
    }
  }

  async fetchSchemaDetails(
    connectionDetails: DatabaseConnectionDto,
  ): Promise<string[]> {
    const client = await this.createDatabaseConnection(connectionDetails);

    try {
      if (connectionDetails.type === DatabaseType.POSTGRES) {
        // Fetch tables for PostgreSQL
        const resTables = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
        `);
        // Extract table names
        return resTables.rows.map((table) => table.table_name);
      } else if (connectionDetails.type === DatabaseType.MYSQL) {
        // Fetch tables for MySQL
        const [tables] = await client.query('SHOW TABLES;');
  
        // Extract table names
        return tables.map((table) => Object.values(table)[0]);
      }
    } catch (error) {
      console.error('Error fetching schema details:', error.message);
      throw new Error('Failed to fetch schema details');
    } finally {
      await client.end();
    }
  }

  async getSchema(
    connectionDetails: DatabaseConnectionDto,
    user: IRedisUserModel,
    token: string,
  ) {
    const isDatabaseExist =
      await this.verifyDatabaseConnection(connectionDetails);
    if (isDatabaseExist) {
      const tableNames = await this.fetchSchemaDetails(connectionDetails);

      await this.AddDatabaseConnection(connectionDetails, user);
      const companyRole = new CompanyRoleModel();
      companyRole.company_id = user.company_id;
      companyRole.role_id = Role.Owner;
      companyRole.table_permission = tableNames;
      await this.roleService.AddCompanyRole(companyRole, user);
      const employee = await this.employeeService.Me(user.employee_id);
      
      return {employee: employee,token: token, tableNames: tableNames};
    } else {
      throw new BadRequestException(
        'The database does not exist or the connection failed.',
      );
    }
  }

  private async AddDatabaseConnection(
    connectionDetails: DatabaseConnectionDto,
    user: IRedisUserModel
  ){
    const databaseConnection = new DatabaseConnectionModel();
    databaseConnection.company_id = user.company_id;
    databaseConnection.type = connectionDetails.type;
    databaseConnection.host = connectionDetails.host;
    databaseConnection.port = connectionDetails.port;
    databaseConnection.user = connectionDetails.user;
    databaseConnection.password = connectionDetails.password;
    databaseConnection.database = connectionDetails.database;

    await this.databaseConnectionRepository.Save(databaseConnection);
  }

  public async GetTables(user: IRedisUserModel) {
    const DatabaseConnection = await this.databaseConnectionRepository.FindOne({
      company_id: user.company_id,
    })

    if(!DatabaseConnection){
      throw new BadRequestException('Database connection details not found');
    }

    return await this.fetchSchemaDetails(DatabaseConnection);
  }
}
