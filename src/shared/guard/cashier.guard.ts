// import {
//     Injectable,
//     CanActivate,
//     ExecutionContext,
//     UnauthorizedException,
//     MethodNotAllowedException,
//     OnModuleInit,
//   } from '@nestjs/common';
//   import { ModuleRef, Reflector } from '@nestjs/core';
//   import { AuthService } from 'src/employee/auth.service';
//   import { PermissionService } from 'src/permission/permission.service';
//   import { RolePermissions } from '../enums/permission.enum';
// import { PortalType } from '../enums/portal.enum';
// import { ACTION_KEY } from '../decorators/action.decorator';
  
//   @Injectable()
//   export class CashierGuard implements CanActivate, OnModuleInit {
//     private reflector: Reflector;
//     private authService: AuthService;
//     private permissionService: PermissionService;
  
//     constructor(private moduleRef: ModuleRef) {}
  
//     onModuleInit() {
//       this.reflector = this.moduleRef.get(Reflector, { strict: false });
//       this.authService = this.moduleRef.get(AuthService, { strict: false });
//       this.permissionService = this.moduleRef.get(PermissionService, {
//         strict: false,
//       });
//     }
  
//     async canActivate(context: ExecutionContext): Promise<boolean> {
//       const action = this.reflector.getAllAndOverride<RolePermissions>(
//         ACTION_KEY,
//         [context.getHandler(), context.getClass()],
//       );
  
//       const user = await this.extractTokenFromHeader(
//         context.switchToHttp().getRequest(),
//       );
  
//       if (!action) {
//         return true;
//       }
  
//       const access = await this.permissionService.CheckPermission(
//         user.role_id,
//         user.employee_id,
//         action,
//       );
  
//       if (!access) {
//         throw new MethodNotAllowedException(
//           'You are not allowed to perform this action',
//         );
//       }
  
//       return access;
//     }
  
//     private async extractTokenFromHeader(req: Request) {
//       let token = req.headers['authorization'] || req.headers['Authorization'];
  
//       if (!token) {
//         throw new UnauthorizedException('Authorization header missing');
//       }
  
//       if (token.startsWith('Bearer')) {
//         token = token.split(' ')[1];
//       }
  
//       try {
//         const tokenResponse = await this.authService.GetUserFromToken(token, PortalType.POS);
  
//         req['cashier'] = tokenResponse.user;
  
//         return tokenResponse.user;
//       } catch (err) {
//         throw new UnauthorizedException('Token is invalid');
//       }
//     }
//   }
  