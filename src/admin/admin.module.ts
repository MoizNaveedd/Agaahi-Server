import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { SharedModule } from "src/shared/shared.module";
import { AdminService } from "./admin.service";
import { AdminRepository } from "./repository/admin.repository";
import { ConfigService } from "@nestjs/config";
import { AdminModel } from "./entity/admin.entity";
import { AdminController } from "./controller/admin.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminModel]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get("JWT_SECRET"),
        };
      },
    }),
    SharedModule,
  ],
  controllers: [AdminController],
  exports: [AdminService],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
