import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { ContactUsRepository } from './contact-us.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsModel } from './entity/contact-us.entity';
import { ContactUsControllerAdmin } from './contact-us-admin.controller';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUsModel]),AdminModule],
  controllers: [ContactUsController,ContactUsControllerAdmin],
  providers: [ContactUsService,ContactUsRepository],
})
export class ContactUsModule {}
