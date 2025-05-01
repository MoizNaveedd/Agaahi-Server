import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUsModel } from './entity/contact-us.entity';

@Injectable()
export class ContactUsRepository extends BaseRepository<ContactUsModel> {
  constructor(
    @InjectRepository(ContactUsModel)
    private contactUsRepository: Repository<ContactUsModel>,
  ) {
    super(contactUsRepository);
  }
}