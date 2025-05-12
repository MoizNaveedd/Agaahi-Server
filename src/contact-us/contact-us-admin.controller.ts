import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto, GetContactUsDto } from './contact-us.dto';
import { CurrentAdmin, CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizedAdmin } from 'src/shared/decorators/authorized.decorator';
import { IRedisAdminModel } from 'src/shared/interfaces/IRedisAdminModel';

@ApiTags('Contact Us Admin')
@Controller('admin/contact-us')
export class ContactUsControllerAdmin {
    constructor(private readonly contactUsService: ContactUsService) {}

    @AuthorizedAdmin()
    @Get('/responses')
    async GetContactUsResponses(@Query() data: GetContactUsDto,@CurrentAdmin() admin: IRedisAdminModel) {
        // Logic to handle the creation of a contact us message
        return this.contactUsService.GetContactUsResponses(data);
    }
}
