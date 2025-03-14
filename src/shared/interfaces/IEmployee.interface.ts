import { Gender } from "../enums/gender.enum";

export interface IEmployee {
  name: string;
  email: string;
  status?: boolean;
  salary?: number;
  password: string;
  country_code: string;
  phone_number: string;
  created_by?: number;
  role_id: number;
  gender?: Gender;
  image?:string;
  company_id: number;
}
