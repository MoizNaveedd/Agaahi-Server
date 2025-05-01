import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "src/shared/database/BaseRepository";
import { Repository } from "typeorm";
import { AdminModel } from "../entity/admin.entity";
import { GetAdminsDto } from "../dto/admin.dto";
import { GetPaginationOptions } from "src/shared/helpers/UtilHelper";

@Injectable()
export class AdminRepository extends BaseRepository<AdminModel> {
  constructor(
    @InjectRepository(AdminModel)
    private adminRepository: Repository<AdminModel>,
  ) {
    super(adminRepository);
  }

  public async GetAdmins(filters: GetAdminsDto) {
    const pagination = GetPaginationOptions(filters);
    const adminQuery = this.Repository.createQueryBuilder("admin").where(
      "admin.is_deleted = 0",
    );
    if (filters.name) {
      adminQuery.andWhere(`full_name ILIKE :search`, {
        search: `%${filters.name}%`,
      });
    }

    if (filters.is_active != null) {
      adminQuery.andWhere(`is_active = :isActive`, {
        isActive: filters.is_active,
      });
    }

    adminQuery.orderBy("admin.full_name");

    if (pagination) {
      adminQuery.skip(pagination.offset);
      adminQuery.take(pagination.limit);
    }

    const [admins, count] = await adminQuery.getManyAndCount();
    return { admins, count };
  }
}