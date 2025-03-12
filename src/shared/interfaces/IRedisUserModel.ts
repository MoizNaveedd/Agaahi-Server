export interface IRedisUserModel {
  employee_id: number;
  company_role_id: number;
  role_id: number;
  company_id: number;
  language: string;
}

export interface IRedisCashierModel extends IRedisUserModel{
  device_id: number;
  store_id: number;
  pos_device_id: number;
  shift_id: number;
}