// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { TwilioService } from "nestjs-twilio";
// import { UnifonicService } from "nestjs-unifonic";
// import axios from "axios";
// @Injectable()
// export class SmsService {
//   private twilioNumber: string;

//   constructor(
//     private twilioService: TwilioService,
//     private unifonicService: UnifonicService,
//     private configService: ConfigService,
//   ) {
//     this.twilioNumber = this.configService.get("TWILIO_FROM");
//   }

//   // Validate E164 format
//   private validE164(num: string): boolean {
//     return /^\+?[1-9]\d{1,14}$/.test(num);
//   }

//   private async sendTextMessageUnifonic(phoneNumber: string, message: string) {
//     if (!this.validE164(phoneNumber)) {
//       throw new Error("number must be E164 format!");
//     }

//     if (this.configService.get<boolean>("UNIFONIC_SMS_ENABLED")) {
//       const response = await this.unifonicService.SendMessage(
//         phoneNumber,
//         message,
//       );
//       console.log("Unifonic Response ===> ", response?.data);
//     } else {
//       return false;
//     }
//   }

//   private async sendTextMessageTwilio(phoneNumber: string, message: string) {
//     try {
//       if (!this.validE164(phoneNumber)) {
//         throw new Error("number must be E164 format!");
//       }

//       if (this.configService.get<boolean>("TWILIO_SMS_ENABLED")) {
//         const response = await this.twilioService.client.messages.create({
//           body: message,
//           to: phoneNumber,
//           from: this.twilioNumber,
//         });
//         console.log(response);
//         return response;
//       } else {
//         return false;
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   public async SendTextMessage(phoneNumber, message) {
//     try {
//       await this.sendTextMessageUnifonic(phoneNumber, message); 
//     } catch (err) {
//       console.log(err);
//     }

//     return true;
//   }
// }
