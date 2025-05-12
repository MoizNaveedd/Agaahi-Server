import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUsModel } from './entity/contact-us.entity';
import { ContactUsDto, GetContactUsDto } from './contact-us.dto';
import { GetPaginationOptions } from 'src/shared/helpers/UtilHelper';

@Injectable()
export class ContactUsRepository extends BaseRepository<ContactUsModel> {
  constructor(
    @InjectRepository(ContactUsModel)
    private contactUsRepository: Repository<ContactUsModel>,
  ) {
    super(contactUsRepository);
  }

  public async GetContactUsResponses(data: GetContactUsDto) {
    const query = await this.Repository.createQueryBuilder('contact_us')
    .leftJoin('contact_us.company', 'company')
    .where('contact_us.is_deleted = :is_deleted', { is_deleted: 0 })

    if(data.company_id) {
      query.andWhere('contact_us.company_id = :company_id', { company_id: data.company_id });
    }

    if(data.date_from) {
      query.andWhere('contact_us.created_at >= :date_from', { date_from: data.date_from });
    }

    if(data.date_to) {
      query.andWhere('contact_us.created_at <= :date_to', { date_to: data.date_to });
    }
    let pagination = GetPaginationOptions(data);
    if(pagination.offset) {
      query.skip(pagination.offset);
    }
    if(pagination.limit) {
      query.take(pagination.limit);
    }

    let result = await query.getManyAndCount();

    return result;
  }
}