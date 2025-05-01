import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { ContactUsRepository } from './contact-us.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsModel } from './entity/contact-us.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUsModel])],
  controllers: [ContactUsController],
  providers: [ContactUsService,ContactUsRepository],
})
export class ContactUsModule {}
