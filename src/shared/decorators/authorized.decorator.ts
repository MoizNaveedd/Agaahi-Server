// import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
// import { ApiBearerAuth } from '@nestjs/swagger';
// import { UserGuard } from '../guard/user.guard';
// import { RolePermissions } from '../enums/permission.enum';
// import { CashierGuard } from '../guard/cashier.guard';
// import { AdminRole } from '../enums/admin-role.enum';
// import { AdminGuard } from '../guard/admin.guard';

// export function Authorized(action?: RolePermissions) {
//   return applyDecorators(
//     SetMetadata('action', action),
//     UseGuards(UserGuard),
//     ApiBearerAuth(),
//   );
// }

// export function AuthorizedCashier(action?: RolePermissions) {
//   return applyDecorators(
//     SetMetadata('action', action),
//     UseGuards(CashierGuard),
//     ApiBearerAuth(),
//   );
// }

// export function AuthorizedAdmin(...roles: AdminRole[]) {
//   return applyDecorators(
//     SetMetadata("roles", roles),
//     UseGuards(AdminGuard),
//     ApiBearerAuth(),
//   );
// }
