import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EmployeeRepository } from './repository/employee.repository';
import { EmployeeModel } from './entity/employee.entity';
import {
  CompareText,
  GetPaginationOptions,
  HashText,
} from 'src/shared/helpers/UtilHelper';
import {
  IRedisCashierModel,
  IRedisUserModel,
} from 'src/shared/interfaces/IRedisUserModel';
// import { CompanyRoleRepository } from 'src/role/repository/company-role.repository';
import {
  AddEmployeeDto,
  ChangePasswordDto,
  GetEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeLanguageDto,
  UpdateMeDtoIMS,
} from './ims/dto/employee.dto';
import Role from 'src/shared/enums/role-ims.enum';
import { IEmployee } from 'src/shared/interfaces/IEmployee.interface';
// import { EmployeeStoreModel } from './entity/employee-store.entity';
// import { EmployeeStoreRepository } from './repository/employee-store.repository';
// import { StoreService } from 'src/store/store.service';
import { ErrorMessageConstant } from 'src/shared/constants/ErrorMessageConstant';
import { Not } from 'typeorm';
// import { GetAWSSignedUrl } from 'src/shared/helpers/MediaHelper';
import { UpdateEmployeeByAdminDto } from './admin/dto/employee.dto';
import { RedisRepository } from 'src/shared/providers/redis.repository';
import { RoleRepository } from 'src/role/repository/role.repository';
@Injectable()
export class EmployeeService {
  constructor(
    private employeeRepository: EmployeeRepository,
    // private companyRoleRepository: CompanyRoleRepository,
    // private employeeStoreRepository: EmployeeStoreRepository,
    // private storeService: StoreService,
    private roleRepository: RoleRepository,
    private redisRepository: RedisRepository,
  ) {}

  // private async updateSession(
  //   token: string,
  //   employee_id: number,
  //   switched_employee_id: number,
  // ): Promise<boolean> {
  //   const rawData: string = await this.redisRepository.Get(
  //     `employee-pos-${token}`,
  //   );

  //   const sessionKey = `employee-pos-${employee_id}`;
  //   if (rawData) {
  //     const rawObject = JSON.parse(rawData);
  //     const sessionData: any = {
  //       ...rawObject,
  //       active_employee_id: switched_employee_id,
  //     };

  //     await Promise.all([
  //       this.redisRepository.Set(
  //         `employee-pos-${token}`,
  //         JSON.stringify(sessionData),
  //       ),
  //       this.redisRepository.Set(
  //         sessionKey,
  //         JSON.stringify({
  //           ...rawObject,
  //           active_employee_id: switched_employee_id,
  //         }),
  //       ),
  //     ]);
  //   }
  //   return true;
  // }

  // public async CheckEmployeeExistByEmail(email: string, company_id?: number) {
  //   const employee = await this.employeeRepository.FindOne(
  //     {
  //       email: email,
  //       is_deleted: 0,
  //       ...(company_id && { company_role: { company_id } }),
  //     },
  //     {
  //       relations: [
  //         'company_role',
  //         'company_role.role',
  //         'company_role.company',
  //         'company_role.role.action_permission',
  //         'company_role.role.page_permission',
  //       ],
  //     },
  //   );
  //   return employee;
  // }

  public async CheckCompanyOwner(company_id: number) {
    const companyOwner = await this.employeeRepository.FindOne(
      {
        company_role: { role_id: Role.Owner, company_id: company_id },
      },
      {
        select: ['id', 'name', 'email', 'status', 'password', 'gender'],
        relations: ['company_role'],
      },
    );
    return companyOwner;
  }

  public async GetAllEmployees(params: GetEmployeeDto, user?: IRedisUserModel) {
    const employees = await this.employeeRepository.GetEmployees(
      params,
      GetPaginationOptions(params),
      user,
    );

    return employees;
  }

  public async CheckEmployeeExistByEmail(email: string, company_id?: number) {
    const employee = await this.employeeRepository.FindOne(
      {
        email: email,
        is_deleted: 0,
        company_id: company_id,
      },
      {
        relations: [
          'company',
          'role',
        ],
      },
    );
    return employee;
  }

  public async AddEmployee(data: AddEmployeeDto, user: IRedisUserModel) {
    if (data.role_id == user?.role_id) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].NotAllowedToSomeRole,
      );
    }

    const employeeExist = await this.employeeRepository.CheckEmployeeExist(data);

    if (employeeExist?.email == data.email) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].EmployeeAlreadyExists,
      );
    } else if (employeeExist){
      throw new BadRequestException(
        ErrorMessageConstant[user.language].PhoneNumberAlreadyExists,
      );
    }

    const role = await this.roleRepository.FindOne({
      id: data.role_id,
      is_deleted: 0,
    });

    if (!role) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].RoleNotExists,
      );
    }

    if (data.role_id == Role.Owner) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].NotAllowedToChangeOwner,
      );
    }


    const employeeData: IEmployee = {
      ...data,
      created_by: user?.employee_id ?? null,
      company_id: user.company_id,
    };

    const employee = await this.CreateEmployee(employeeData);

    return employee;
  }

  public async CreateEmployee(data) {
    const employee = new EmployeeModel();
    employee.email = data.email;
    employee.name = data.name;
    employee.phone_number = data.phone_number;
    employee.country_code = data.country_code;
    employee.pin = data.pin;
    employee.salary = data.salary ?? 0;
    employee.status = data?.status != undefined ? data.status : true;
    employee.password = data.password ? await HashText(data.password) : '';
    employee.role_id = data.role_id;
    employee.created_by = data.created_by ?? null;
    employee.gender = data?.gender ?? null;
    employee.company_id = data.company_id;

    return await this.employeeRepository.Save(employee);
  }

  // public async DeleteEmployee(employeeId: number, user: IRedisUserModel) {
  //   const employeeRole = await this.employeeRepository.FindOne(
  //     {
  //       id: employeeId,
  //     },
  //     {
  //       relations: ['company_role'],
  //     },
  //   )

  //   if (!employeeRole) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[user.language].EmployeeNotExists,
  //     );
  //   }

  //   if (employeeRole?.company_role.role_id == Role.Owner) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[user.language].NotAllowedToDeleteAdmin,
  //     );
  //   }

  //   if (
  //     employeeRole?.company_role.role_id == Role.Admin &&
  //     user.role_id == Role.Admin
  //   ) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[user.language].NotAllowedToDeleteAdmin,
  //     );
  //   }

  //   await this.employeeRepository.DeleteById(employeeId, true);
  //   return true;
  // }

  public async UpdateMe(data: UpdateMeDtoIMS, user: IRedisUserModel, image?) {
    const updateData: Partial<IEmployee> = {
      ...(image?.location && { image: image.location }),
      ...(data.name && { name: data.name }),
    };

    await this.employeeRepository.Update(
      {
        id: user.employee_id,
      },
      updateData,
    );

    // updateData.image = await GetAWSSignedUrl(updateData.image);
    return updateData;
  }

  public async UpdateEmployee(
    employeeId: number,
    data: UpdateEmployeeDto,
    user: IRedisUserModel,
  ) {
    const [employee, employeeExist] = await Promise.all([
      this.employeeRepository.FindOne(
        {
          id: employeeId,
        },
        {
          relations: ['role'],
        },
      ),
      this.employeeRepository.CheckEmployeeExist(data, user.company_id),
    ]);

    if (!employee) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].EmployeeNotExists,
      );
    }

    if (employeeExist && employeeExist.id != employeeId) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].EmployeeAlreadyExists,
      );
    }

    if (
      (employee?.role_id == Role.Owner &&
        user.role_id != Role.Owner) ||
      (data?.status == false && employee?.role_id == Role.Owner)
    ) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].NotAllowedToChangeOwner,
      );
    }

    if (
      employee?.role_id == Role.Admin &&
      user.role_id == Role.Admin
    ) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].NotAllowedToUpdateAdmin,
      );
    }

    if (data.role_id) {
      const role = await this.roleRepository.FindOne({
        id: data.role_id,
        is_deleted: 0,
      });
  
      if (!role) {
        throw new BadRequestException(
          ErrorMessageConstant[user.language].RoleNotExists,
        );
      }
    }


    employee.name = data.name ?? employee.name;
    employee.email = data.email ?? employee.email;    
    employee.phone_number = data.phone_number ?? employee.phone_number;
    employee.country_code = data.country_code ?? employee.country_code;
    employee.salary = data.salary ?? employee.salary;
    employee.status = Boolean(data.status) ?? employee.status;
    employee.password = data.password
      ? await HashText(data.password)
      : employee.password;
    employee.updated_by = user.employee_id;
    employee.role_id = data.role_id ?? employee.role_id;
    employee.gender = data.gender ?? employee.gender;

    // if (data.store_ids) {
    //   await this.AddEmployeeStore(employeeId, data.store_ids, user.company_id);
    // }

    await this.employeeRepository.Update(
      { id: employeeId },
      {
        role_id: employee.role_id,
        name: employee.name,
        phone_number: employee.phone_number,
        country_code: employee.country_code,
        pin: employee.pin,
        salary: employee.salary,
        status: employee.status,
        password: employee.password,
        updated_by: employee.updated_by,
        gender: employee.gender,
        email: employee.email,
      },
    );
    return employee;
  }

  // public async AddEmployeeStore(
  //   employee_id: number,
  //   store_ids: number[],
  //   company_id: number,
  //   deleteAddedStores = true,
  // ) {
  //   if (!store_ids || store_ids.length == 0) {
  //     return null;
  //   }
  //   const [stores, employeeStoreExist] = await Promise.all([
  //     this.storeService.CheckStoreAgainstCompany(store_ids, company_id),
  //     this.employeeStoreRepository.Find({
  //       employee_id: employee_id,
  //     }),
  //   ]);

  //   if (employeeStoreExist?.length > 0 && deleteAddedStores) {
  //     await this.employeeStoreRepository.DeleteByIds(
  //       employeeStoreExist.map((es) => es.id),
  //       false,
  //     );
  //   }

  //   const employeeStore = [];
  //   stores.forEach((store) => {
  //     const employeeStoreModel = new EmployeeStoreModel();
  //     employeeStoreModel.employee_id = employee_id;
  //     employeeStoreModel.store_id = store.id;

  //     employeeStore.push(employeeStoreModel);
  //   });

  //   return await this.employeeStoreRepository.SaveAll(employeeStore);
  // }

  public async Me(
    employee_id: number,
  ): Promise<any> {
    const employee = await this.employeeRepository.FindOne(
        {
          id: employee_id,
          is_deleted: 0,
          
        },
        { relations: ['role', 'company'] },
      );


    delete employee.password;
    return { employee };
  }

  public async GetEmployeeById(employeeId: number, user?: IRedisUserModel) {
    const employee = await this.employeeRepository.FindOne(
      {
        id: employeeId,
        is_deleted: 0,
        ...(user && { company_id: user.company_id }),
      },
      {
        select: [
          'id',
          'name',
          'email',
          'status',
          'pin',
          'country_code',
          'phone_number',
          'salary',
          'gender',
          'image',
        ],
        relations: [
          'role',
          'company',
        ],
      },
    );

    if (!employee) {
      return null;
    }
    return employee;
  }

  public async UpdateEmployeeLanguage(
    data: UpdateEmployeeLanguageDto,
    user: IRedisUserModel | IRedisCashierModel,
  ) {
    const employee = await this.employeeRepository.FindById(user.employee_id);

    if (!employee) {
      throw new BadRequestException(
        ErrorMessageConstant[user.language].EmployeeNotExists,
      );
    }

    employee.language = data.user_language ?? employee.language;

    await this.employeeRepository.Update(
      { id: user.employee_id },
      { language: employee.language },
    );

    return employee;
  }

  public async ValidatePin(pin: string, cashier: IRedisCashierModel) {
    const hasPin = await this.employeeRepository.FindOne({
      pin: pin,
      is_deleted: 0,
      id: cashier.employee_id,
    });

    if (!hasPin) {
      throw new BadRequestException(
        ErrorMessageConstant[cashier.language].IncorrectPin,
      );
    }
    return { validated: !!hasPin };
  }

  public async ValidatePinVersionZeroPointOne(data, cashier, token) {
    const hasPin = await this.employeeRepository.FindOne({
      pin: data.pin,
      is_deleted: 0,
      id: data.employee_id,
    });

    if (!hasPin) {
      throw new BadRequestException(
        ErrorMessageConstant[cashier.language].IncorrectPin,
      );
    }

    if(hasPin.status == false) {
      throw new BadRequestException(
        ErrorMessageConstant[cashier.language].EmployeeAccountSuspended,
      );
    }

    // await this.updateSession(token, cashier.employee_id, data.employee_id);
    return { validated: !!hasPin };
  }

  public async GetEmployeeName(user: IRedisUserModel, params: GetEmployeeDto) {
    const employeeModel = await this.employeeRepository.GetEmployees(
      params,
      GetPaginationOptions(params),
      user,
    );
    const employee = employeeModel.employees.map((employee) => {
      return {
        id: employee.id,
        name: employee.name,
        status: employee.status,
      };
    });

    return {
      employee,
      count: employeeModel.count,
    };
  }

  public async ChangePassword(
    data: ChangePasswordDto,
    user?: IRedisUserModel,
    employeeId?: number,
  ) {
    let employeeModel: EmployeeModel = await this.employeeRepository.FindOne(
      { id: user?.employee_id ?? employeeId, is_deleted: 0 },
      {
        select: ['id', 'country_code', 'phone_number', 'password', 'language'],
      },
    );

    if (!employeeModel) {
      throw new ForbiddenException(
        'User with this phone number does not exist.',
      );
    }

    const passwordIsValid = await CompareText(
      data.password,
      employeeModel.password,
    );
    if (!passwordIsValid) {
      throw new BadRequestException(
        ErrorMessageConstant[employeeModel.language].PasswordIncorrect,
      );
    }

    const password = await HashText(data.new_password);
    await this.employeeRepository.Update(
      { id: employeeModel.id },
      { password: password },
    );

    return true;
  }

  public async UpdateEmployeeByAdmin(
    employeeId: number,
    data: UpdateEmployeeByAdminDto,
  ) {
    const employee = await this.employeeRepository.FindOne({
      id: employeeId,
    });

    if (!employee) {
      throw new BadRequestException(
        ErrorMessageConstant['en'].EmployeeNotExists,
      );
    }

    employee.password = data.password
      ? await HashText(data.password)
      : employee.password;
    employee.status = data.status ?? employee.status;
    employee.pin = data.pin ?? employee.pin;

    await this.employeeRepository.Update(
      { id: employeeId },
      {
        password: employee.password,
        status: employee.status,
        pin: employee.pin,
      },
    );
    delete employee.password;
    return employee;
  }

  public async GetEmployeeNameForPOS(user: IRedisCashierModel, params) {
    return await this.employeeRepository.GetEmployeesForPos(
      params,
      GetPaginationOptions(params),
      user,
    );
  }
}
