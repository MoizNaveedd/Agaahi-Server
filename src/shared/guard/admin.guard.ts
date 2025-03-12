// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import { AdminRole } from "../enums/admin-role.enum";
// import { AdminService } from "src/admin/admin.service";
// import { ROLES_KEY } from "../decorators/roles.decorator";

// @Injectable()
// export class AdminGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private adminService: AdminService
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
//       ROLES_KEY, 
//       [
//         context.getHandler(),
//         context.getClass(),
//       ]
//     );

//     const admin = await this.extractTokenFromHeader(
//       context
//         .switchToHttp()
//         .getRequest()
//     );

//     if (!requiredRoles.length) {
//       return true;
//     }

//     return requiredRoles.includes(admin.role);
//   }

//   private async extractTokenFromHeader(req: Request) {
//     let token = req.headers["authorization"] || req.headers["Authorization"];

//     if (!token) {
//       throw new UnauthorizedException("Authorization header missing");
//     }

//     if (token.startsWith("Bearer")) {
//       token = token.split(" ")[1];
//     }

//     try {
//       const tokenResponse = await this.adminService.GetAdminFromToken(token);

//       req["admin"] = tokenResponse.admin;
//       const admin = await this.adminService.GetAdminById(
//         tokenResponse.admin.id
//       );

//       return admin;

//     } catch (err) {
//       throw new UnauthorizedException("Token is invalid");
//     }
//   }
// }