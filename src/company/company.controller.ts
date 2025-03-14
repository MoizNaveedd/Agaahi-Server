import { Controller, Get } from '@nestjs/common';

@Controller('company')
export class CompanyController {

    @Get()
    async getHello (){
        return "hi"
    }
}
