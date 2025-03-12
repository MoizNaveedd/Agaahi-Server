import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

// Transformer for converting boolean strings to boolean in query params
@Injectable()
export class StringToBooleanPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    if (typeof value === 'object') {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          const element = value[key];
          if (typeof element === 'string') {
            if (element === 'true') {
              value[key] = true;
            }
            if (element === 'false') {
              value[key] = false;
            }
          }
        }
      }
      return value;
    }

    return value;
  }
}
