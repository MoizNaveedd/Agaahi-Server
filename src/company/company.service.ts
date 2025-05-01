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

@Injectable()
export class CompanyService {
    constructor(private companyRepository: CompanyRepository,
      private employeeService: EmployeeService,
      private companyRoleRepository: CompanyRoleRepository,
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

    await this.employeeService.CreateEmployee(employeeData);

    const companyRole = new CompanyRoleModel();
    companyRole.company_id = companyModel.id;
    companyRole.role_id = Role.Owner;

    await this.companyRoleRepository.Save(companyRole);

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
    return { company: companyModel };
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
