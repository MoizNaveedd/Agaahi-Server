import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class LowercasePipe implements PipeTransform {
  constructor(private readonly keysToLowercase: string[]) {}

  transform(data: any) {
    for (const key of this.keysToLowercase) {
      if (data[key]) {
        data[key] = data[key].toLowerCase();
      }
    }
    return data;
  }
}
