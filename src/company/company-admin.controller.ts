import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetCompanyDto, RegisterCompanyDto } from './company.dto';
import { CompanyService } from './company.service';
import { AuthorizedAdmin } from 'src/shared/decorators/authorized.decorator';

@Controller('admin/company')
export class CompanyAdminController {
  constructor(private readonly companyService: CompanyService) {}

  @AuthorizedAdmin()
  @Get('/')
  async GetAllCompanies(@Query() data: GetCompanyDto) {
    return this.companyService.GetCompanies(data);
  }
}
