import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisRepository } from 'src/shared/providers/redis.repository';
import { EmployeeService } from 'src/employee/employee.service';
import { CompareText, HashText } from 'src/shared/helpers/UtilHelper';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  ValidateEmailDto,
} from './ims/dto/employee.dto';
import { EmployeeRepository } from './repository/employee.repository';
import { EmployeeModel } from './entity/employee.entity';
import { ErrorMessageConstant } from 'src/shared/constants/ErrorMessageConstant';
import { Language } from 'src/shared/enums/language.enum';
import {
  IRedisCashierModel,
  IRedisUserModel,
} from 'src/shared/interfaces/IRedisUserModel';
// import { CashierDeviceRepository } from 'src/pos-device/repository/cashier-device.repository';
// import { PosDeviceRepository } from 'src/pos-device/repository/pos-device.repository';
// import { LoginPosDto } from './pos/dto/employee.dto';
import { PortalType } from 'src/shared/enums/portal.enum';
import { appEnv } from '../shared/helpers/EnvHelper';
import { ConfigService } from '@nestjs/config';
// import { MailService } from 'src/shared/providers/mail.service';
import Role from 'src/shared/enums/role-ims.enum';
// import { GetAWSSignedUrl } from 'src/shared/helpers/MediaHelper';
// import * as moment from 'moment';
import dayjs from 'dayjs';



@Injectable()
export class AuthService {
  constructor(
    private redisRepository: RedisRepository,
    private jwtService: JwtService,
    private employeeService: EmployeeService,
    private employeeRepository: EmployeeRepository,
    // private cashierDeviceRepository: CashierDeviceRepository,
    // private posDeviceRepository: PosDeviceRepository,
    private configService: ConfigService,
    // private mailService: MailService,
  ) {}

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

  public async Logout(
    user: IRedisUserModel | IRedisCashierModel,
    portal: string,
  ) {
    const deviceId = (user as IRedisCashierModel)?.device_id ?? null;
    const sessionKey =
      portal == PortalType.POS && deviceId
        ? `employee-pos-${user.employee_id}-${deviceId}`
        : `employee-${portal}-${user.employee_id}`;

    // if (portal == PortalType.POS && deviceId) {
    //   const cashierDevice = await this.cashierDeviceRepository.FindOne({
    //     id: deviceId,
    //   });
    //   await Promise.all([
    //     this.cashierDeviceRepository.DeleteById(deviceId),
    //     this.posDeviceRepository.Update(
    //       {
    //         id: cashierDevice.pos_device_id,
    //       },
    //       { is_bound: false },
    //     ),
    //   ]);
    // }

    if (sessionKey) {
      await this.deleteUserToken(sessionKey);
    }
    return { logged_out: true };
  }

  // public async DeleteUserTokenByCompanyId(companyId: number): Promise<void> {
  //   const [employee, cashier] = await Promise.all([
  //     this.employeeRepository.GetEmployees({ is_active: true, company_id: companyId }),
  //     // this.cashierDeviceRepository.GetCashierDeviceByCompanyId(companyId),
  //   ]);
    
  //    await Promise.all(
  //     employee.employees.map(async (emp) => {
  //       const [employeeKey] = await this.redisRepository.GetKeys(
  //         `employee-ims-${emp.id}`,
  //       );

  //       if (employeeKey) {
  //         await this.deleteUserToken(employeeKey);
  //       }
  //     }),
  //   );

  //   await Promise.all(
  //     cashier.map(async (cashier) => {
  //       const [employeeKey] = await this.redisRepository.GetKeys(
  //         `employee-pos-${cashier.employee_id}-${cashier.id}`,
  //       );

  //       if (employeeKey) {
  //         await this.deleteUserToken(employeeKey);
  //       }
  //     }),
  //   )

  //   return null;
  // }

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

  public async GetUserFromToken(token: string, portal: string): Promise<any> {
    const rawData: string = await this.redisRepository.Get(
      `employee-${portal}-${token}`,
    );

    if (rawData) {
      const rawObject = JSON.parse(rawData);
      const userData: any = {
        employee_id: rawObject.employeeId,
        company_role_id: rawObject.companyRoleId,
        role_id: rawObject.roleId,
        company_id: rawObject.companyId,
        language: rawObject.language,
        portal: rawObject.portal,
      };

      // Add device_id for POS only
      if (portal == PortalType.POS && rawObject.device_id) {
        userData.device_id = rawObject.device_id;

        if (rawObject.pos_device_id) {
          userData.store_id = rawObject.store_id;
          userData.pos_device_id = rawObject.pos_device_id;
          userData.shift_id = rawObject.shift_id ? rawObject.shift_id : null;
        }
      }

      if (rawObject?.active_employee_id) {
        userData.active_employee_id = rawObject.active_employee_id;
      }

      return { user: userData };
    }
    return null;
  }

  public async LoginIMS(data: LoginDto) {
    const userLanguage = data.user_language ?? Language.English;
    const employee = await this.validateUserCredentials(data, userLanguage);

    // const domain = data.email.split('@')[1];
    // let isVerified = false;
    // if (
    //   (['mailinator.com', 'yopmail.com'].includes(domain) &&
    //     appEnv('ENVIRONMENT') == 'development') ||
    //   true
    // ) {
    //   isVerified = true;
    // } else {
    //   // isVerified = await this.VerifyMFACode(data.mfa_code, employee.id);
    // }

    // if (!isVerified) {
    //   throw new BadRequestException(
    //     ErrorMessageConstant[employee.language].MFACodeInvalid,
    //   );
    // }

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

    employee.language = userLanguage;
    employee.last_ims_login = null;
    await this.employeeRepository.Save(employee);

    // if (employee.company_role.company.logo) {
    //   employee.company_role.company.logo = await GetAWSSignedUrl(
    //     employee.company_role.company.logo,
    //   );
    // }

    delete employee.password;
    delete employee.company.password;
    return { employee: employee, token: token };
  }

  // public async LoginPOS(data: LoginPosDto) {
  //   const userLanguage = data.user_language ?? Language.English;
  //   const cashier = await this.validateUserCredentials(data, userLanguage);

  //   let cashierDevice;
  //   if (data.device_id) {
  //     cashierDevice = await this.cashierDeviceRepository.BindDeviceToCashier(
  //       cashier,
  //       data.device_id,
  //     );
  //   } else {
  //     cashierDevice =
  //       await this.cashierDeviceRepository.RegisterDevice(cashier);
  //   }

  //   if (!cashierDevice) {
  //     throw new BadRequestException('No device found');
  //   }

  //   const token = this.generateToken(
  //     cashier.id,
  //     cashier.company_role.role_id,
  //     cashier.company_role.company_id,
  //     cashier.company_role.id,
  //     userLanguage,
  //     PortalType.POS,
  //     cashierDevice.id,
  //   );

  //   await this.setSession(
  //     `employee-pos-${token}`,
  //     cashier.id,
  //     cashier.company_role.role_id,
  //     cashier.company_role.company_id,
  //     cashier.company_role.id,
  //     userLanguage,
  //     PortalType.POS,
  //     cashierDevice.id,
  //   );

  //   cashier.language = userLanguage;
  //   cashier.last_pos_login = moment(Date.now()).toISOString();
  //   await this.employeeRepository.Save(cashier);

  //   delete cashier.password;
  //   delete cashier.company_role.company.password;
  //   return {
  //     ...(await this.employeeService.Me(cashier.id)),
  //     token: token,
  //   };
  // }

  // public async VerifyMFACode(
  //   code: string,
  //   employeeId: number,
  // ): Promise<boolean> {
  //   const employee = await this.employeeRepository.FindOne(
  //     { id: employeeId },
  //     {
  //       select: ['id', 'is_mfa_enabled', 'mfa_secret', 'language', 'gender'],
  //     },
  //   );

  //   if (!employee.mfa_secret) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[employee.language].QRCodeNotScanned,
  //     );
  //   }

  //   const isVerified: boolean = speakeasy.totp.verify({
  //     secret: employee.mfa_secret,
  //     encoding: 'base32',
  //     token: code,
  //   });

  //   if (isVerified && !employee.is_mfa_enabled) {
  //     await this.employeeRepository.Update(
  //       { id: employee.id },
  //       { is_mfa_enabled: true },
  //     );
  //   }

  //   return isVerified;
  // }

  // public async ValidateEmail(data: ValidateEmailDto): Promise<{
  //   full_name: string;
  //   qr_code: string;
  //   secret: string;
  // }> {
  //   const employee: EmployeeModel = await this.employeeRepository.FindOne(
  //     { email: data.email },
  //     {
  //     select: [
  //       'id',
  //       'name',
  //       'country_code',
  //       'phone_number',
  //       'email',
  //       'password',
  //       'status',
  //       'is_mfa_enabled',
  //       'language',
  //       'gender',
  //       'company_role.role.status',
  //       'company_role.company.is_active',
  //     ],
  //     relations: ['company_role', 'company_role.company', 'company_role.role'],
  //     }
  //   );

  //   const userLanguage = data.user_language ?? Language.English;

  //   if (!employee) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].EmailCredentialsInvalid,
  //     );
  //   } else if (!employee.status) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].EmployeeAccountSuspended,
  //     );
  //   } else if (!employee.company_role.role.status) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].EmployeeRoleSuspended,
  //     );
  //   } else if (!employee.company_role.company.is_active) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].InactiveCompany,
  //     );
  //   }

  //   const passwordIsValid = await CompareText(data.password, employee.password);
  //   if (!passwordIsValid) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].PasswordIncorrect,
  //     );
  //   }

  //   if (!employee.is_mfa_enabled) {
  //     const { qr_code, secret } = await this.GenerateMFASecret(employee);

  //     return {
  //       full_name: `Snad-${employee.name}`,
  //       qr_code,
  //       secret,
  //     };
  //   }

  //   return {
  //     full_name: `Snad-${employee.name}`,
  //     qr_code: null,
  //     secret: null,
  //   };
  // }




  private async validateUserCredentials(data, language) {
    const employee = await this.employeeService.CheckEmployeeExistByEmail(
      data.email,
    );

    if (!employee) {
      throw new BadRequestException(
        ErrorMessageConstant[language].EmailCredentialsInvalid,
      );
    } else if (!employee.status) {
      throw new BadRequestException(
        ErrorMessageConstant[language].EmployeeAccountSuspended,
      );
    } else if (!employee.role.status) {
      throw new BadRequestException(
        ErrorMessageConstant[language].EmployeeRoleSuspended,
      );
    } else if (!employee.company.is_active) {
      throw new BadRequestException(
        ErrorMessageConstant[language].InactiveCompany,
      );
    }

    const passwordIsValid = await CompareText(data.password, employee.password);
    if (!passwordIsValid) {
      throw new BadRequestException(
        ErrorMessageConstant[language].PasswordIncorrect,
      );
    }
    return employee;
  }

  // private async GenerateMFASecret(employee: EmployeeModel) {
  //   const secret = speakeasy.generateSecret({
  //     name: `Snad-${employee.name}`,
  //   });

  //   const QRCode = await qrcode.toDataURL(secret.otpauth_url);
  //   if (!QRCode) {
  //     throw new InternalServerErrorException(
  //       "Couldn't generate QR code, please try again.",
  //     );
  //   }

  //   await this.employeeRepository.Update(
  //     { id: employee.id },
  //     {
  //       is_mfa_enabled: false,
  //       mfa_secret: secret.base32,
  //     },
  //   );

  //   return {
  //     qr_code: QRCode,
  //     secret: secret.base32,
  //   };
  // }

  // public async ForgotPassword(data: ForgotPasswordDto) {
  //   const employee = await this.employeeService.CheckEmployeeExistByEmail(
  //     data.email,
  //   );

  //   const userLanguage =
  //     data.user_language ?? employee?.language ?? Language.English;

  //   if (!employee) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].EmailCredentialsInvalid,
  //     );
  //   } else if (!employee.status) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].EmployeeAccountSuspended,
  //     );
  //   } else if (!employee.company_role.role.status) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].EmployeeRoleSuspended,
  //     );
  //   }

  //   const token = await this.CreateForgotPasswordToken(employee);

  //   const replacements = {
  //     FullName: employee.name,
  //     ResetPasswordLink: `https://${this.configService.get('APP_URL')}/change-password/${token}`,
  //   };
  //   const mailOptions = {
  //     to: employee.email,
  //     from: this.configService.get('MAIL_SENDER_EMAIL'),
  //     subject: 'Reset Password',
  //   };
  //   // this.mailService.SendMail('reset-password.html', replacements, mailOptions);
  //   return true;
  // }

  // private async CreateForgotPasswordToken(employee: EmployeeModel) {
  //   const token = this.generateToken(
  //     employee.id,
  //     employee.company_role.role_id,
  //     employee.company_role.company_id,
  //     employee.company_role.id,
  //     employee.language,
  //   );

  //   return token;
  // }

  // public async ResetPassword(data: ResetPasswordDto, token: string) {
  //   const userLanguage = data.user_language ?? Language.English;

  //   let decoded = this.jwtService.verify(token);
  //   if (!decoded) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[userLanguage].TokenInvalid,
  //     );
  //   }
  //   const employee = await this.employeeRepository.FindOne(
  //     {
  //       id: decoded.employee_id,
  //     },
  //     {
  //       select: ['id', 'password', 'language'],
  //     },
  //   );

  //   employee.password = await HashText(data.password);

  //   const [employeeKey] = await this.redisRepository.GetKeys(
  //     `employee-ims-${employee.id}`,
  //   );

  //   if (employeeKey) {
  //     await this.deleteUserToken(employeeKey);
  //   }

  //   await this.employeeRepository.Update(
  //     { id: employee.id },
  //     {
  //       password: employee.password,
  //     },
  //   );
  //   return true;
  // }

  // public async MfaRevoke(employeeId: number, user?: IRedisUserModel) {
  //   const employee = await this.employeeRepository.FindOne(
  //     {
  //       id: employeeId,
  //       is_deleted: 0,
  //       ...(user && { company_role: { company_id: user.company_id } }),
  //     },
  //     {
  //       select: ['id', 'is_mfa_enabled', 'mfa_secret'],
  //       relations: ['company_role'],
  //     },
  //   );

  //   if (!employee) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[user.language].EmployeeNotFound,
  //     );
  //   }

  //   if (user) {
  //     if (
  //       employee?.company_role?.role_id == Role.Owner &&
  //       user.role_id != Role.Owner
  //     ) {
  //       throw new BadRequestException(
  //         ErrorMessageConstant[user.language].NotAllowedToChangeOwner,
  //       );
  //     }

  //     if (
  //       employee?.company_role.role_id == Role.Admin &&
  //       user.role_id == Role.Admin
  //     ) {
  //       throw new BadRequestException(
  //         ErrorMessageConstant[user.language].NotAllowedToUpdateAdmin,
  //       );
  //     }
  //   }
  //   if (employee.is_mfa_enabled) {
  //     await this.employeeRepository.Update(
  //       { id: employeeId },
  //       {
  //         is_mfa_enabled: false,
  //         mfa_secret: null,
  //       },
  //     );
  //   }
  //   return true;
  // }
}
