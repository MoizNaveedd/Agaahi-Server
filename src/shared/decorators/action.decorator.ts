import { SetMetadata } from '@nestjs/common';
import { RolePermissions } from '../enums/permission.enum';

export const ACTION_KEY = 'action';
export const Actions = (...action: RolePermissions[]) =>
  SetMetadata(ACTION_KEY, action);
