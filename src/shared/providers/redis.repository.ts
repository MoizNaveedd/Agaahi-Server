import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as redis from 'redis';

@Injectable()
export class RedisRepository {
  private Connection;

  constructor(private configService: ConfigService) {
    this.createConnection();
  }

  private async createConnection() {
    this.Connection = redis.createClient({
      password: this.configService.get('DB_REDIS_PASS'),
      socket: {
        host: this.configService.get('DB_REDIS_HOST'),
        port: this.configService.get('DB_REDIS_PORT'),
      },
      disableOfflineQueue: true,
    });

    await this.Connection.connect();
    console.log('Redis Connected');
  }

  public async Get(token: string): Promise<any> {
    return await this.Connection.get(token);
  }

  public async Set(token: string, data: any): Promise<any> {
    return await this.Connection.set(token, data);
  }

  public async ExpireAt(token: string, timeStamp: number): Promise<any> {
    return await this.Connection.expireAt(token, timeStamp);
  }

  public async Delete(token: string): Promise<any> {
    return await this.Connection.del(token);
  }

  public async GetKeys(pattern: string): Promise<any> {
    return await this.Connection.keys(pattern);
  }
}
