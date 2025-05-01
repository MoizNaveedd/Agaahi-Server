import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from './company.repository';
import { CompanyModel } from './entity/company.entity';
import { EmployeeModule } from 'src/employee/employee.module';
import { RoleModule } from 'src/role/role.module';
import { CompanyAdminController } from './company-admin.controller';
import { AdminModule } from 'src/admin/admin.module';
import { SharedModule } from 'src/shared/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyModel]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
        };
      },
    }),
    EmployeeModule,
    RoleModule,
    AdminModule,
    SharedModule,
  ],
  controllers: [CompanyController, CompanyAdminController],
  providers: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
