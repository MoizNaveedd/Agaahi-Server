import { Logger, Module } from '@nestjs/common';
import { RedisRepository } from './providers/redis.repository';
// import { MailService } from './providers/mail.service';

@Module({
  imports: [],
  providers: [RedisRepository,Logger],
  exports: [RedisRepository,Logger],
})
export class SharedModule {}
