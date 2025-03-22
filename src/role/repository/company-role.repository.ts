import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRoleModel } from '../entity/company-role.entity';

@Injectable()
export class CompanyRoleRepository extends BaseRepository<CompanyRoleModel> {
  constructor(
    @InjectRepository(CompanyRoleModel)
    private companyRoleRepository: Repository<CompanyRoleModel>,
  ) {
    super(companyRoleRepository);
  }
}
//   public async GetCompanyRoles(user, filters, paginationParams) {
//     const query = this.Repository.createQueryBuilder('company_role')
//       .leftJoinAndSelect('company_role.role', 'role')
//       .leftJoinAndSelect('role.page_permission', 'page_permission')
//       .leftJoinAndSelect('role.action_permission', 'action_permission')
//       .where('company_role.company_id = :company_id', {
//         company_id: user.company_id,
//       })
//       .andWhere('company_role.is_deleted = :IsDeleted', { IsDeleted: 0 });

//     if (filters.status != undefined) {
//       query.andWhere('role.status = :status', { status: filters.status });
//     }

//     if (filters.name) {
//       query.andWhere('LOWER(role.name) LIKE :name', {
//         name: `%${filters.name.toLowerCase()}%`,
//       });
//     }

//     if (paginationParams) {
//       query.skip(paginationParams.offset);
//       query.take(paginationParams.limit);
//     }

//     const [roles, count] = await query.getManyAndCount();
//     return { roles, count };
//   }
// }
