import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseConnectionModel } from './entity/database-connection.entity';

@Injectable()
export class DatabaseConnectionRepository extends BaseRepository<DatabaseConnectionModel> {
  constructor(
    @InjectRepository(DatabaseConnectionModel)
    private dbconnectionRepository: Repository<DatabaseConnectionModel>,
  ) {
    super(dbconnectionRepository);
  }
}