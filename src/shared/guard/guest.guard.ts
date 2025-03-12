// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { JwtService } from "@nestjs/jwt";
// import { JwtPayload } from "jsonwebtoken";
// import { ErrorMessageConstant } from "../constants/ErrorMessageConstant";
// import { Language } from "../enums/language.enum";
// import { PosDeviceService } from "src/pos-device/pos-device.service";

// const rateLimitedEndpoints = [
//   "/api/pos/employee/login",
// ];

// @Injectable()
// export class GuestGuard implements CanActivate {
//   constructor(
//     private jwtService: JwtService,
//     private configService: ConfigService,
//     private posDeviceService: PosDeviceService,
//   ) {}

//   private isValidToken(token) {
//     try {
//       const deviceToken = this.jwtService.verify(
//         token,
//         { secret: this.configService.get("JWT_DEVICE_SECRET") }
//       ) as JwtPayload;

//       return deviceToken;
//     } catch (err) {
//       console.log(err);
//       return null;
//     }
//   }

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();
//     const token = req.headers["x-bb-device-token"];
//     const language = req.body?.language || req.body?.user_language || Language.Arabic;

//     if (!token) {
//       throw new UnauthorizedException("x-bb-device-token header is missing");
//     }

//     const validToken = this.isValidToken(token) as JwtPayload;
//     if (!validToken) {
//       throw new UnauthorizedException("x-bb-device-token is invalid");
//     }

//     const allowedSendingAttempts = this.configService.get("SMS_SENDING_ATTEMPTS", 5);
//     const smsWaitTimeInMinutes = this.configService.get("RESEND_SMS_THRESHOLD", 2);

//     let verifyToken = await this.posDeviceService.VerifyDeviceToken(token);

//     if (!verifyToken) {
//       verifyToken = await this.posDeviceService.SetDeviceData(
//         token,
//         validToken.device_id
//       );
//     }

//     if (!rateLimitedEndpoints.includes(req.url)) {
//       req["device"] = verifyToken;
//       return true;
//     }

//     let sendingAttempts = verifyToken.sending_attempts;

//     const lastUpdated = verifyToken.last_updated;
//     const currentTime = new Date(new Date().toISOString());

//     if (lastUpdated) {
//       const diffMs = currentTime.getTime() - new Date(lastUpdated).getTime();

//       const differenceInMinutes = Math.floor(diffMs / 1000 / 60);

//       if (
//         differenceInMinutes <= smsWaitTimeInMinutes &&
//         verifyToken.sending_attempts >= allowedSendingAttempts
//       ) {
//         throw new BadRequestException(ErrorMessageConstant[language].TryAgainLater);
//       }

//       if (differenceInMinutes > smsWaitTimeInMinutes) {
//         verifyToken = await this.posDeviceService.SetDeviceData(
//           token,
//           validToken.device_id
//         );
//         sendingAttempts = verifyToken.sending_attempts;
//       }
//     }

//     verifyToken.sending_attempts = sendingAttempts + 1;
//     verifyToken.last_updated = currentTime;

//     await this.posDeviceService.UpdateDeviceData(token, verifyToken);

//     req["device"] = verifyToken;

//     return true;
//   }
// }