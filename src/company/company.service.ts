import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterCompanyDto } from './company.dto';
import { ErrorMessageConstant } from 'src/shared/constants/ErrorMessageConstant';
import { Language } from 'src/shared/enums/language.enum';
import { CompanyRepository } from './company.repository';
import { CompanyModel } from './entity/company.entity';
import { GetPaginationOptions, HashText } from 'src/shared/helpers/UtilHelper';
import { IEmployee } from 'src/shared/interfaces/IEmployee.interface';
import Role from 'src/shared/enums/role-ims.enum';
import { EmployeeService } from 'src/employee/employee.service';
import { CompanyRoleModel } from 'src/role/entity/company-role.entity';
import { CompanyRoleRepository } from 'src/role/repository/company-role.repository';
import { RedisRepository } from 'src/shared/providers/redis.repository';
import { PortalType } from 'src/shared/enums/portal.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CompanyService {
    constructor(private companyRepository: CompanyRepository,
      private employeeService: EmployeeService,
      private companyRoleRepository: CompanyRoleRepository,
          private jwtService: JwtService,
    
      private redisRepository: RedisRepository, // Assuming you have a Redis repository to handle Redis operations
    ){}

    public async RegisterCompany(data: RegisterCompanyDto){
        const [companyExist] = await Promise.all([
            this.companyRepository.CheckCompanyExist(data),
          ]);
      
          const userLanguage = data.user_language || Language.English;
          if (companyExist) {
            let error: string;
            if (data.email == companyExist?.email) {
              error = ErrorMessageConstant[userLanguage].EmailAlreadyExists;
            } else {
              error = ErrorMessageConstant[userLanguage].PhoneNumberAlreadyExists;
            }
            throw new BadRequestException(error);
          }
          
    const companyModel = await this.CreateCompany(data);

    const employeeData: IEmployee = {
      ...data,
      role_id: Role.Owner,
      name: data.first_name + ' ' + data.last_name,
      status: true,
      gender: data?.gender ?? null,
      company_id: companyModel.id,
    };

    const employee = await this.employeeService.CreateEmployee(employeeData);

    const companyRole = new CompanyRoleModel();
    companyRole.company_id = companyModel.id;
    companyRole.role_id = Role.Owner;

    await this.companyRoleRepository.Save(companyRole);

    const [employeeKey] = await this.redisRepository.GetKeys(
      `employee-ims-${employee.id}`,
    );

    if (employeeKey) {
      // remove previous key from cache
      await this.deleteUserToken(employeeKey);
    }

    const token = this.generateToken(
      employee.id,
      employee.role_id,
      employee.company_id,
      userLanguage,
    );

    await this.setSession(
      `employee-ims-${token}`,
      employee.id,
      employee.role_id,
      employee.company_id,
      // employee.company_role.id,
      userLanguage,
    );


    // await this.mailOwnerDetails(employeeData);

    // this.SendVerificationCode({
    //   email: data.email,
    //   user_language: userLanguage,
    // });
    // this.SendVerificationCode({
    //   phone_number: data.phone_number,
    //   country_code: data.country_code,
    //   user_language: userLanguage,
    // });
    // companyModel.logo = await GetAWSSignedUrl(companyModel.logo);

    delete companyModel['password'];
    return { company: companyModel , employee: employee, token: token };
    }

    
      public generateToken(
        employee_id: number,
        role_id: number,
        company_id: number,
        // company_role_id: number,
        language: string,
        portal = PortalType.IMS,
        device_id?: number,
      ): string {
        const tokenPayload = {
          employee_id: employee_id,
          role_id: role_id,
          company_id: company_id,
          // company_role_id: company_role_id,
          language: language,
          portal: portal,
        };
    
        // Include device_id only if the portal is POS
        if (portal == PortalType.POS && device_id) {
          tokenPayload['device_id'] = device_id;
        }
    
        return this.jwtService.sign(tokenPayload);
      }
    
      public async setSession(
        token: string,
        employeeId: number,
        roleId: number,
        companyId: number,
        // companyRoleId: number,
        language: string,
        portal = PortalType.IMS,
        device_id?: number,
      ): Promise<boolean> {
        // Use the updated session key format with device_id for POS
        const sessionKey =
          portal == PortalType.POS && device_id
            ? `employee-pos-${employeeId}-${device_id}`
            : `employee-${portal}-${employeeId}`;
    
        const sessionData: any = {
          employeeId: employeeId,
          roleId: roleId,
          companyId: companyId,
          // companyRoleId: companyRoleId,
          language: language,
          portal: portal,
          // active_employee_id: employeeId,
        };
    
        // Include device_id only for POS sessions
        if (portal == PortalType.POS && device_id) {
          sessionData.device_id = device_id;
        }
    
        await this.redisRepository.Set(token, JSON.stringify(sessionData));
    
        await this.redisRepository.Set(
          sessionKey,
          JSON.stringify({
            token: token,
            roleId: roleId,
            companyId: companyId,
            // companyRoleId: companyRoleId,
            language: language,
            portal: portal,
            // active_employee_id: employeeId,
            // device_id: device_id, // Add device_id for POS
          }),
        );
    
        return true;
      }

    private async deleteUserToken(employeeKey): Promise<void> {
      const rawData = await this.redisRepository.Get(employeeKey);
      const rawObject = JSON.parse(rawData);
      if(rawData) {
        await Promise.all([
          this.redisRepository.Delete(employeeKey),
          this.redisRepository.Delete(rawObject.token),
        ]);
      }
      return null;
    }

    private async CreateCompany(
        data: RegisterCompanyDto,
        image?,
      ) {
        let companyModel = new CompanyModel();
        companyModel.name = data.business_name;
        companyModel.phone_number = data.phone_number;
        companyModel.email = data.email;
        companyModel.country_code = data.country_code;
        companyModel.password = data.password ? await HashText(data.password) : '';
        companyModel.language = data.user_language;
        companyModel.first_name = data.first_name;
        companyModel.last_name = data.last_name;
        companyModel.logo = image?.location;
        companyModel.is_active = true;
        companyModel.is_database_validated = false;
    
        await this.companyRepository.Create(companyModel);
    
        // const companySettingModel = new CompanySettingModel();
        // companySettingModel.company_id = companyModel.id;
        // companyModel.company_setting =
        //   await this.companySettingRepository.Create(companySettingModel);
    
        // const paymentMethods = PaymentMethods.map((paymentMethod) => {
        //   const method = new CompanyPaymentMethodModel();
        //   method.company_id = companyModel.id;
        //   method.en_name = paymentMethod.en_name;
        //   method.ar_name = paymentMethod.ar_name;
        //   method.type = paymentMethod.type;
        //   method.service_fee_percentage = paymentMethod.serviceFee;
        //   method.icon = paymentMethod.icon;
        //   method.is_active = paymentMethod.is_active;
        //   return method;
        // });
    
        // await this.companyPaymentMethodRepository.SaveAll(paymentMethods);
        return companyModel;
      }

      public async GetCompanies(params){
        return await this.companyRepository.GetCompanies(params);
      }
}
