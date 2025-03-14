import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterCompanyDto } from './company.dto';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('/register-company')
  async RegisterCompanyAndOwner(@Body() data: RegisterCompanyDto) {
    const userInfo = await this.companyService.RegisterCompany(data);
    return userInfo;
  }
}
