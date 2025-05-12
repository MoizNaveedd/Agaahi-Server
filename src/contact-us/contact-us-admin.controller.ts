import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto, GetContactUsDto } from './contact-us.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizedAdmin } from 'src/shared/decorators/authorized.decorator';

@ApiTags('Contact Us Admin')
@Controller('admin/contact-us')
export class ContactUsControllerAdmin {
    constructor(private readonly contactUsService: ContactUsService) {}

    @AuthorizedAdmin()
    @Get()
    async GetContactUsResponses(@Query() contactUsDto: GetContactUsDto) {
        // Logic to handle the creation of a contact us message
        return this.contactUsService.GetContactUsResponses(contactUsDto);
    }
}
