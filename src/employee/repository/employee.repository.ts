import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EmployeeModel } from '../entity/employee.entity';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';

@Injectable()
export class EmployeeRepository extends BaseRepository<EmployeeModel> {
  constructor(
    @InjectRepository(EmployeeModel)
    private employeeRepository: Repository<EmployeeModel>,
  ) {
    super(employeeRepository);
  }

  public async GetEmployees(filters, paginationParam?, user?: IRedisUserModel) {
    const query = this.Repository.createQueryBuilder('employee')
      .select([
        'employee.id',
        'employee.name',
        'employee.country_code',
        'employee.phone_number',
        'employee.email',
        'employee.status',
        'employee.image',
        'employee.pin',
        'employee.is_mfa_enabled',
        'employee.gender',
        'role',
        'company',
      ])
      .leftJoin('employee.role', 'role')
      .leftJoin('employee.company', 'company')
      .where('employee.is_deleted = :is_deleted', {
        is_deleted: 0,
      });
    if (user?.company_id || filters?.company_id) {
      query.andWhere('employee.company_id = :company_id', {
        company_id: user?.company_id ?? filters?.company_id,
      });
    }
    query
      .andWhere('employee.is_deleted = :is_deleted', {
        is_deleted: 0,
      })

    if (filters?.name) {
      query.andWhere('LOWER(employee.name) LIKE :name', {
        name: `%${filters.name.toLowerCase()}%`,
      });
    }

    if (filters?.status != undefined) {
      query.andWhere('employee.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.role_id) {
      query.andWhere('employee.role_id = :role_id', {
        role_id: +filters.role_id,
      });
    }

    if (paginationParam) {
      query.skip(paginationParam.offset);
      query.take(paginationParam.limit);
    }

    const [employees, count] = await query.getManyAndCount();
    return { employees, count };
  }

  public async GetEmployeesForPos(
    filters,
    paginationParam,
    user?: IRedisUserModel,
  ) {
    const query = this.Repository.createQueryBuilder('employee')
      .select(['employee.id', 'employee.name', 'employee.image'])
      .leftJoin('employee.company_role', 'company_role')
      .leftJoin('employee.employee_store', 'employee_store')
      .where('employee.is_deleted = :is_deleted', {
        is_deleted: 0,
      })
      .andWhere('company_role.is_deleted = :is_deleted', {
        is_deleted: 0,
      });

    if (user?.company_id || filters?.company_id) {
      query.andWhere('company_role.company_id = :company_id', {
        company_id: user?.company_id ?? filters?.company_id,
      });
    }

    if (filters?.name) {
      query.andWhere('LOWER(employee.name) LIKE :name', {
        name: `%${filters.name.toLowerCase()}%`,
      });
    }

    if (filters?.status != undefined) {
      query.andWhere('employee.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.store_id) {
      query.andWhere('employee_store.store_id = :store_id', {
        store_id: filters.store_id,
      });
    }

    if (paginationParam) {
      query.skip(paginationParam.offset);
      query.take(paginationParam.limit);
    }

    const [employees, count] = await query.getManyAndCount();
    return { employees, count };
  }

  public async CheckEmployeeExist(
    data,
    companyId?: number,
    employeeId?: number,
  ) {
    const employeeQuery = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.role', 'role')
      .where('employee.is_deleted = :is_deleted', { is_deleted: 0 })
      .andWhere(
        new Brackets((employeeQuery) => {
          employeeQuery.where('employee.email = :email', { email: data.email });
          employeeQuery.orWhere(
            new Brackets((cb) => {
              cb.where('employee.country_code = :country_code', {
                country_code: data.country_code,
              }).andWhere('employee.phone_number = :phone_number', {
                phone_number: data.phone_number,
              });
            }),
          );
        }),
      );

    if (companyId) {
      employeeQuery.andWhere('employee.company_id = :company_id', {
        company_id: companyId,
      });
    }
    if (employeeId) {
      employeeQuery.andWhere('employee.id != :employee_id', {
        employee_id: employeeId,
      });
    }
    return await employeeQuery.getOne();
  }

  public async GetEmployeeDetails(employeeId: number): Promise<EmployeeModel> {
    const query = this.Repository.createQueryBuilder('employee')
      .select([
        'employee.id',
        'employee.name',
        'employee.country_code',
        'employee.phone_number',
        'employee.email',
        'employee.status',
        'employee.image',
        'employee.pin',
        'employee.is_mfa_enabled',
        'employee.gender',
        'role',
        'company',
      ])
      .leftJoin('employee.role', 'role')
      .leftJoin('employee.company', 'company')
      .where('employee.id = :employeeId', { employeeId })
      .andWhere('employee.is_deleted = :is_deleted', { is_deleted: 0 });

    return await query.getOne();
  }
}
