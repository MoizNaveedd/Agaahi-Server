import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { EmployeeModel } from './entity/employee.entity';
import { EmployeeRepository } from './repository/employee.repository';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './ims/controller/employee.controller';
import { SharedModule } from 'src/shared/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RoleModule } from 'src/role/role.module';
import { EmployeeControllerAdmin } from './admin/controller/employee.controller';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeModel]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
        };
      },
    }),
    SharedModule,
    forwardRef(() => RoleModule),
    AdminModule,
  ],
  controllers: [EmployeeController, EmployeeControllerAdmin],
  providers: [
    EmployeeRepository,
    EmployeeService,
    AuthService,
  ],
  exports: [EmployeeService, AuthService, EmployeeRepository],
})
export class EmployeeModule {}
