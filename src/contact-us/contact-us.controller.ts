import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto } from './contact-us.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Contact Us')
@Controller('contact-us')
export class ContactUsController {
    constructor(private readonly contactUsService: ContactUsService) {}

    @Post()
    async createContactUs(@Body() contactUsDto: ContactUsDto) {
        // Logic to handle the creation of a contact us message
        return this.contactUsService.createContactUs(contactUsDto);
    }
}
