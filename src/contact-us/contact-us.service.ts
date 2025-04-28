import { Injectable } from '@nestjs/common';
import { ContactUsRepository } from './contact-us.repository';
import { ContactUsDto } from './contact-us.dto';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { ContactUsModel } from './entity/contact-us.entity';

@Injectable()
export class ContactUsService {
    constructor(
        private contactUsRepository: ContactUsRepository,
    ) {}

    public async createContactUs(data: ContactUsDto, user: IRedisUserModel) {
        const contactUs = new ContactUsModel();
        contactUs.first_name = data.first_name;
        contactUs.last_name = data.last_name;
        contactUs.email = data.email;
        contactUs.message = data.message;
        contactUs.created_by = user.employee_id; // Assuming employee_id is the ID of the user creating the contact us message
        contactUs.company_id = user.company_id || null; // Set company_id if provided, otherwise null

        return await this.contactUsRepository.Save(contactUs);
    }
}
