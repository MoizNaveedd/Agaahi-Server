import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GetPaginationOptions } from 'src/shared/helpers/UtilHelper';
import { CompanyModel } from './entity/company.entity';
import { GetCompanyDto } from './company.dto';

@Injectable()
export class CompanyRepository extends BaseRepository<CompanyModel> {
  constructor(
    @InjectRepository(CompanyModel)
    private companyRepository: Repository<CompanyModel>,
  ) {
    super(companyRepository);
  }

  public async CheckCompanyExist(data, is_new_company: boolean = true) {
    const companyQuery = this.Repository.createQueryBuilder('company').where(
      'company.is_deleted = :is_deleted',
      { is_deleted: 0 },
    );
    if (is_new_company) {
      companyQuery.andWhere('company.is_email_verified = :is_email_verified', {
        is_email_verified: true,
      });
      companyQuery.andWhere('company.is_phone_verified = :is_phone_verified', {
        is_phone_verified: true,
      });
    }
    companyQuery.andWhere(
      new Brackets((companyQuery) => {
        if (data?.email) {
          companyQuery.where('company.email = :email', { email: data.email });
        }

        if (data?.phone_number) {
          companyQuery.orWhere(
            new Brackets((qb) => {
              qb.where(`company.country_code = :country_code`, {
                country_code: data.country_code,
              }).andWhere(`company.phone_number = :phone_number`, {
                phone_number: data.phone_number,
              });
            }),
          );
        }
      }),
    );
    return await companyQuery.getOne();
  }

  public async GetCompanies(filters: GetCompanyDto) {
    const pagination = GetPaginationOptions(filters);
    const query = this.Repository.createQueryBuilder('company')
      .select([
        'company.id',
        'company.name',
        'company.email',
        'company.is_active',
        'company.created_at',
        'COUNT(DISTINCT employee.id) AS total_employees',
      ])
      .leftJoin('employee', 'employee', 'employee.company_id = company.id')
      .where('company.is_deleted = :is_deleted', { is_deleted: 0 })
      .groupBy('company.id')
      .orderBy('company.created_at', 'DESC');

    if (filters.search) {
      query.andWhere(
        '(company.name ILIKE :search OR company.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.is_active !== undefined) {
      query.andWhere('company.is_active = :is_active', {
        is_active: filters.is_active,
      });
    }

    query.offset(pagination.offset).limit(pagination.limit);

    const [companies, total] = await Promise.all([
      query.getRawMany(),
      query.getCount(),
    ]);

    return {
      companies,
      count: total,
    };
  }

  public async GetCompaniesName(filters: GetCompanyDto) {
    const pagination = GetPaginationOptions(filters);
    const query = this.Repository.createQueryBuilder('company')
      .select([
        'company.id',
        'company.name',
        'company.email',
      ])
      .where('company.is_deleted = :is_deleted', { is_deleted: 0 })
      .groupBy('company.id')
      .orderBy('company.created_at', 'DESC');

    if (filters.search) {
      query.andWhere(
        'company.name ILIKE :search OR company.email ILIKE :search',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.is_active !== undefined) {
      query.andWhere('company.is_active = :is_active', {
        is_active: filters.is_active,
      });
    }

    query.offset(pagination.offset).limit(pagination.limit);

    const [companies, total] = await Promise.all([
      query.getRawMany(),
      query.getCount(),
    ]);

    return {
      companies,
      count: total,
    };
  }
}
