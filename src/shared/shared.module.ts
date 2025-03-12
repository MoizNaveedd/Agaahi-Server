import { Module } from '@nestjs/common';
import { RedisRepository } from './providers/redis.repository';
// import { MailService } from './providers/mail.service';

@Module({
  imports: [],
  providers: [RedisRepository],
  exports: [RedisRepository],
})
export class SharedModule {}
