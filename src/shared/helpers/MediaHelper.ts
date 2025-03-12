// import {
//   S3Client,
//   DeleteObjectCommand,
//   PutObjectCommand,
//   GetObjectCommand,
//   GetObjectCommandInput,
// } from '@aws-sdk/client-s3';
// import * as multerS3 from 'multer-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import * as multer from 'multer';
// import { v4 as uuidv4 } from 'uuid';
// import * as sharp from 'sharp';
// import { BadRequestException } from '@nestjs/common';
// import { appEnv } from './EnvHelper';
// import { S3Prefix } from '../enums/s3-prefix.enum';
// import { AllowedFileType } from '../constants/AllowedFileType';
// import { MulterModuleOptions } from '@nestjs/platform-express';

// const s3Client = new S3Client({
//   region: appEnv('AWS_S3_REGION', 'us-east-2'),
//   credentials: {
//     accessKeyId: appEnv('AWS_ACCESS_KEY_ID'),
//     secretAccessKey: appEnv('AWS_SECRET_ACCESS_KEY'),
//   },
// });

// const fileFilter = (req: any, file: any, cb: any) => {
//   const imageFileType = ['image/jpeg', 'image/jpg', 'image/png'];

//   if (
//     req.url == '/company/register-company' &&
//     imageFileType.indexOf(file.mimetype) === -1
//   ) {
//     return cb(new BadRequestException('Uploaded file type is not supported.'));
//   } else if (req.url.match(/\/category/) && file.mimetype != 'image/png') {
//     return cb(new BadRequestException('Upload file is not png'));
//   } else if (AllowedFileType.indexOf(file.mimetype) === -1) {
//     return cb(new BadRequestException('Uploaded file type is not supported.'));
//   }

//   cb(null, true);
// };

// const limits = {
//   fieldNameSize: 255,
//   fieldSize: 1024 * 1024 * 20,
//   fileSize: 1024 * 1024 * 20,
// };


// const multerObj = (prefix: S3Prefix): MulterModuleOptions => ({
//   storage: multerS3({
//     s3: s3Client,
//     bucket: appEnv("AWS_S3_BUCKET"),
//     key: function (request, file, cb) {
//       const fileName = file.originalname.replace(/[^A-Z0-9/.]/gi, "_");
//       const awsFileName = `snad/${prefix}/${Date.now().toString()}_${fileName}`;
//       console.log("awsFileName ==> ", awsFileName);
//       cb(null, awsFileName);
//     },
//     shouldTransform: function (req, file, cb) {
//       cb(null, /^image/i.test(file.mimetype));
//     },
//     transforms: () => {
//       return sharp().resize(600);
//     },
//   }),
//   fileFilter,
//   limits,
// });

// export function publicMulter(prefix: S3Prefix): MulterModuleOptions {
//   const publicMulterObj: MulterModuleOptions = {
//     storage: multerS3({
//       s3: s3Client,
//       bucket: appEnv('AWS_CDN_BUCKET') || appEnv('AWS_S3_BUCKET'),
//       key: (request, file, cb) => {
//         const fileName = file.originalname.replace(/[^A-Z0-9/.]/gi, '_');
//         const awsFileName = `snad/${prefix}/${Date.now().toString()}_${fileName}`;
//         cb(null, awsFileName);
//       },
//     }),
//     fileFilter,
//     limits,
//   };
//   return publicMulterObj;
// }

// export async function DeleteAWSFile(
//   fileName: string,
//   bucketName?: string,
// ): Promise<void> {
//   try {
//     const command = new DeleteObjectCommand({
//       Bucket: bucketName || appEnv('AWS_S3_BUCKET'),
//       Key: fileName,
//     });
//     await s3Client.send(command);
//     console.log(`File ${fileName} deleted successfully.`);
//   } catch (error) {
//     console.error('Error deleting file from AWS:', error);
//     throw new BadRequestException('Failed to delete file from S3.');
//   }
// }

// export async function GetAWSSignedUrl(url, expires = null) {
//   try {
//     if (!url) return null;

//     const key = GetFileKey(url);
//     const param: GetObjectCommandInput = {
//       Bucket: appEnv('AWS_S3_BUCKET'),
//       Key: key.replace(/^\/+/g, ''),
//       ResponseContentDisposition: 'inline',
//     };

//     const expiresIn = expires || +appEnv('AWS_S3_SIGNED_URL_EXPIRATION');
//     return await getSignedUrl(s3Client, new GetObjectCommand(param), {
//       expiresIn,
//     });
//   } catch (error) {
//     console.error('Cannot generate signed URL from AWS:', error);
//     return null;
//   }
// }

// export function GetFileKey(url) {
//   const urlObj = new URL(url);
//   const key = urlObj.pathname.replace(/^\/+/, '');
//   return key;
// }

// export async function UploadFileBufferToS3(buffer: Buffer): Promise<string> {
//   try {
//     const bucketName = appEnv('AWS_S3_BUCKET');
//     const fileKey = uuidv4();

//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: fileKey,
//       Body: buffer,
//     });

//     await s3Client.send(command);
//     const fileUrl = `https://${bucketName}.s3.${appEnv('AWS_S3_REGION', 'us-east-2')}.amazonaws.com/${fileKey}`;

//     return fileUrl;
//   } catch (error) {
//     console.error('Error uploading file buffer to AWS:', error);
//     throw new BadRequestException('Failed to upload file buffer to S3.');
//   }
// }

// export { multerObj };
