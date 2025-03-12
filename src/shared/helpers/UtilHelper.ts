import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomInt } from 'crypto';
import { appEnv } from './EnvHelper';
// import { createCanvas, loadImage } from 'canvas';
// import * as JsBarcode from 'jsbarcode';

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

export interface PaginationDBParams {
  limit: number;
  offset: number;
}

export async function HashText(plainText: string): Promise<any> {
  return new Promise(function (resolve, reject) {
    bcrypt.hash(plainText, 10, function (error, hash) {
      if (error) {
        reject(error);
      } else {
        resolve(hash);
      }
    });
  });
}

export async function CompareText(plainText, hash): Promise<any> {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(plainText, hash, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

export function GetVerificationCode(email: string, phone: string) {
  let verificationCode = Math.floor(1000 + Math.random() * 9000);

  if (
    process.env['ENVIRONMENT'] === 'development' ||
    (email && process.env['EMAIL_VERIFICATION'] == 'false') ||
    (phone && process.env['SMS_VERIFICATION'] == 'false')
  ) {
    verificationCode = 1234;
  }

  return verificationCode;
}

export function RandomPinGenerator() {
  let pin = '';
  for (let i = 0; i < appEnv('PIN_LENGTH', 4); i++) {
    pin += randomInt(0, 10).toString();
  }
  return pin;
}

export interface PaginationRequestParams {
  limit?: number;
  page?: number;
}

/**
 * Casts PaginationRequestParams to PaginationDBParams
 * @param {PaginationRequestParams} params
 * @returns {PaginationDBParams}
 */
export function GetPaginationOptions(params: PaginationRequestParams) {
  const options: PaginationDBParams = {
    limit: 100,
    offset: 0,
  };

  const limit = params.limit;
  const page = params.page || 1;

  if (limit) {
    options.limit = parseInt(limit.toString());
  }

  if (page) {
    options.offset = options.limit * Math.max(page - 1, 0);
  }
  return options;
}

export function EncryptPayload(text) {
  try {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return `${iv.toString('hex')}_${encrypted.toString('hex')}`;
  } catch (err) {
    return null;
  }
}

export function DecryptPayload(hashed) {
  try {
    const hash = hashed.split('_');

    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash[0], 'hex'),
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash[1], 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString();
  } catch (err) {
    return null;
  }
}

export function ExcludeFields<T>(model: T, keys: string[]): Omit<T, keyof T> {
  const clonedModel = { ...model } as Record<string, any>; // Cast to Record<string, any> for dynamic keys

  for (const key of keys) {
      const keyParts = key.split('.');
      let tempObj: any = clonedModel;

      // Traverse the object to find the nested key and delete it
      for (let i = 0; i < keyParts.length; i++) {
          const part = keyParts[i];
          if (i === keyParts.length - 1) {
              // If it's the last part, delete the property
              delete tempObj[part];
          } else {
              // If the part doesn't exist, break out
              if (!tempObj[part]) break;
              tempObj = tempObj[part]; // Move deeper into the object
          }
      }
  }

  return clonedModel as Omit<T, keyof T>; // Return the modified object
}
