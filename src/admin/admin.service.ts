import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisRepository } from 'src/shared/providers/redis.repository';
import { AdminRepository } from './repository/admin.repository';

import { CompareText, HashText } from 'src/shared/helpers/UtilHelper';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { AdminRole } from 'src/shared/enums/admin-role.enum';
import { IRedisAdminModel } from 'src/shared/interfaces/IRedisAdminModel';
import { AdminModel } from './entity/admin.entity';
import {
  AddAdminDto,
  AdminLoginDto,
  GetAdminsDto,
  UpdateAdminDto,
  UpdateMeDto,
  ValidateAccountDto,
} from './dto/admin.dto';
import { appEnv } from 'src/shared/helpers/EnvHelper';

@Injectable()
export class AdminService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private adminRepository: AdminRepository,
    private redisRepository: RedisRepository,
  ) {}

  private GenerateToken(adminId: number): string {
    return this.jwtService.sign({ id: adminId });
  }

  private async SetSession(
    token: string,
    adminId: number,
    count = 1,
  ): Promise<boolean> {
    await this.redisRepository.Set(
      token,
      JSON.stringify({
        adminId: adminId,
        count: count,
      }),
    );
    // Expire After 12 hours
    const expireAt = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

    this.redisRepository.ExpireAt(token, expireAt);

    await this.redisRepository.Set(adminId.toString(), token);
    this.redisRepository.ExpireAt(adminId.toString(), expireAt);
    return true;
  }

  private async GenerateMFASecret(admin: AdminModel) {
    const secret = speakeasy.generateSecret({
      name: admin.full_name,
    });

    const QRCode = await qrcode.toDataURL(secret.otpauth_url);
    if (!QRCode) {
      throw new InternalServerErrorException(
        "Couldn't genereate QR code, please try again.",
      );
    }

    await this.adminRepository.Update(
      { id: admin.id },
      {
        is_mfa_enabled: false,
        mfa_secret: secret.base32,
      },
    );

    return {
      qr_code: QRCode,
      secret: secret.base32,
    };
  }

  public async ValidateAccount(data: ValidateAccountDto): Promise<{
    full_name: string;
    qr_code: string;
  }> {
    const admin: AdminModel = await this.adminRepository.FindOne(
      { email: data.email },
      {
        select: [
          'id',
          'full_name',
          'country_code',
          'phone_number',
          'email',
          'password',
          'is_active',
          'is_mfa_enabled',
        ],
      },
    );

    if (!admin) {
      throw new BadRequestException('Email or password is incorrect.');
    } else if (!admin.is_active) {
      throw new BadRequestException('Your account is suspended.');
    }

    const passwordIsValid = await CompareText(data.password, admin.password);
    if (!passwordIsValid) {
      throw new BadRequestException('Password is incorrect.');
    }

    if (!admin.is_mfa_enabled) {
      const { qr_code } = await this.GenerateMFASecret(admin);

      return {
        full_name: admin.full_name,
        qr_code,
      };
    }

    return {
      full_name: admin.full_name,
      qr_code: null,
    };
  }

  public async LoginAdmin(data: AdminLoginDto) {
    const admin: AdminModel = await this.adminRepository.FindOne(
      { email: data.email },
      {
        select: ["id", "full_name", "email", "is_active", "password", "role", "mfa_secret", "is_mfa_enabled" ,"is_deleted", "phone_number", "country_code", "created_at", "updated_at", "created_by", "updated_by" ],
      },
    );

    if (!admin) {
      throw new BadRequestException('Email or password is incorrect.');
    } else if (!admin.is_active) {
      throw new BadRequestException('Your account is suspended.');
    }

    const passwordIsValid = await CompareText(data.password, admin.password);
    if (!passwordIsValid) {
      throw new BadRequestException('Password is incorrect.');
    }

    // const domain = data.email.split('@')[1];
    // let isVerified = false;
    // if (
    //   ['mailinator.com', 'yopmail.com'].includes(domain) &&
    //   appEnv('ENVIRONMENT') == 'development'
    // ) {
    //   isVerified = true;
    // } else {
    //   isVerified = await this.VerifyMFACode(data.mfa_code, admin.id);
    // }

    // if (!isVerified) {
    //   throw new BadRequestException('MFA code Invalid');
    // }

    let token: string;
    delete admin['password'];
    delete admin['mfa_secret'];

    const [tokenKey]: any = await this.redisRepository.GetKeys(`${admin.id}`);

    if (tokenKey) {
      await this.DeleteAdminTokens(tokenKey);
    }
    token = this.GenerateToken(admin.id);
    await this.SetSession(`admin-${token}`, admin.id, 1);

    return { admin: admin, token: token };
  }

  public async MfaRevoke(adminId: number) {
    const adminModel = await this.adminRepository.FindOne(adminId);

    if (!adminModel) {
      throw new BadRequestException('Admin Not Found');
    }

    await this.adminRepository.Update({
      id: adminId,
    }, {
      is_mfa_enabled: false,
      mfa_secret: null,
    })
    return true;
  }

  public async GetAdminFromToken(token: string): Promise<any> {
    const rawData: string = await this.redisRepository.Get(`admin-${token}`);

    if (rawData) {
      try {
        const rawObject = JSON.parse(rawData);

        const date = new Date();
        await this.redisRepository.ExpireAt(
          rawObject.adminId.toString(),
          date.setDate(date.getDate() + 1),
        );

        return {
          admin: {
            id: rawObject.adminId,
          },
        };
      } catch (err) {
        console.log(err);
      }
    }
    return null;
  }

  // public async VerifyMFACode(code: string, adminId: number): Promise<boolean> {
  //   const admin = await this.adminRepository.FindOne(
  //     { id: adminId },
  //     {
  //       select: ['id', 'is_mfa_enabled', 'mfa_secret'],
  //     },
  //   );

  //   if (!admin.mfa_secret) {
  //     throw new BadRequestException('QR Code is not scanned.');
  //   }

  //   const isVerified: boolean = speakeasy.totp.verify({
  //     secret: admin.mfa_secret,
  //     encoding: 'base32',
  //     token: code,
  //   });

  //   if (isVerified && !admin.is_mfa_enabled) {
  //     await this.adminRepository.Update(
  //       { id: admin.id },
  //       { is_mfa_enabled: true },
  //     );
  //   }

  //   return isVerified;
  // }

  public async GetAdmins(params: GetAdminsDto) {
    const admins = await this.adminRepository.GetAdmins(params);
    return admins;
  }

  public async GetAdminById(adminId: number) {
    const admin = await this.adminRepository.FindOne({ id: adminId });
    return admin;
  }

  public async AddAdmin(data: AddAdminDto, admin: IRedisAdminModel) {
    let adminModel = await this.adminRepository.FindOne({
      email: data.email,
      is_deleted: 0,
    });

    if (adminModel) {
      throw new BadRequestException(
        'Admin with provided email already exists.',
      );
    }

    adminModel = new AdminModel();
    adminModel.is_active = data.is_active;
    adminModel.full_name = data.full_name;
    adminModel.country_code = data.country_code;
    adminModel.phone_number = data.phone_number.replace(/^0+/, '');
    adminModel.email = data.email;
    adminModel.password = await HashText(data.password);
    adminModel.role = data.role ? data.role : AdminRole.Admin;
    adminModel.created_by = admin.id;

    adminModel = await this.adminRepository.Create(adminModel);

    delete adminModel['password'];
    return adminModel;
  }

  public async UpdateAdmin(adminId: number, data: UpdateAdminDto) {
    let adminModel = await this.adminRepository.FindOne({ id: adminId });

    if (!adminModel) {
      throw new BadRequestException('Invalid admin id.');
    }

    if (adminModel.role == AdminRole.SuperAdmin) {
      throw new BadRequestException("Can't update super admin.");
    }

    adminModel.is_active =
      data.is_active != null ? data.is_active : adminModel.is_active;
    adminModel.full_name = data.full_name || adminModel.full_name;
    adminModel.country_code = data.country_code || adminModel.country_code;
    adminModel.phone_number = data.phone_number
      ? data.phone_number.replace(/^0+/, '')
      : adminModel.phone_number;
    adminModel.role = data.role ? data.role : adminModel.role;

    adminModel = await this.adminRepository.Create(adminModel);
    return adminModel;
  }

  public async DeleteAdminById(adminId: number) {
    const adminModel = await this.adminRepository.FindById(adminId);

    if (!adminModel) {
      throw new BadRequestException('Invalid admin id.');
    }

    if (adminModel.role == AdminRole.SuperAdmin) {
      throw new BadRequestException('Cannot delete Super Admin');
    }

    await this.adminRepository.DeleteById(adminId);

    return null;
  }

  public async UpdateMe(adminId: number, data: UpdateMeDto) {
    const adminModel = await this.adminRepository.FindOne(
      { id: adminId },
      {
        select: [
          'id',
          'full_name',
          'country_code',
          'phone_number',
          'email',
          'password',
          'role',
        ],
      },
    );

    if (!adminModel) {
      throw new BadRequestException('Invalid admin id.');
    }

    adminModel.full_name = data.full_name || adminModel.full_name;
    adminModel.country_code = data.country_code || adminModel.country_code;
    adminModel.phone_number = data.phone_number
      ? data.phone_number.replace(/^0+/, '')
      : adminModel.phone_number;

    if (data.password) {
      const passwordIsValid = await CompareText(
        data.previous_password,
        adminModel.password,
      );
      if (!passwordIsValid) {
        throw new BadRequestException('Old password is incorrect.');
      }

      adminModel.password = await HashText(data.password);
    }

    await this.adminRepository.Update({ id: adminId }, adminModel);
    delete adminModel['password'];

    return adminModel;
  }

  public async LogOutAdmin(admin: IRedisAdminModel): Promise<void> {
    const [tokenKey]: any = await this.redisRepository.GetKeys(`${admin.id}`);
    await this.DeleteAdminTokens(tokenKey);
    return null;
  }

  private async DeleteAdminTokens(userTokenKey): Promise<void> {
    const oldToken = await this.redisRepository.Get(userTokenKey);
    await Promise.all([
      this.redisRepository.Delete(userTokenKey),
      this.redisRepository.Delete(oldToken),
    ]);
    return null;
  }
}
