import { Body, Controller, Post } from '@nestjs/common';
import { DatabasevalidatorService } from './database-validator.service';
import { DatabaseConnectionDto } from './database-validator.dto';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';

@Controller('database-validator')
export class DatabaseValidatorController {
  constructor(private readonly databaseValidatorService: DatabasevalidatorService ) {}

  @Authorized()
  @Post('verify')
  async verifyDatabase(@Body() connectionDetails: DatabaseConnectionDto, @CurrentUser() user: IRedisUserModel) {
    const isValid = await this.databaseValidatorService.verifyDatabaseConnection(connectionDetails);
    return { success: isValid, message: isValid ? 'Database connection successful' : 'Failed to connect to database' };
  }

  @Authorized()
  @Post('schema')
  async getSchema(@Body() connectionDetails: DatabaseConnectionDto, @CurrentUser() user: IRedisUserModel) {
    return await this.databaseValidatorService.getSchema(connectionDetails, user);
  }
}
