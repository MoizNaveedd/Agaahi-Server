import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { RoleModel } from '../entity/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleRepository extends BaseRepository<RoleModel> {
  constructor(
    @InjectRepository(RoleModel)
    private roleRepository: Repository<RoleModel>,
  ) {
    super(roleRepository);
  }
}
