import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next) {
    const { ip, method, originalUrl } = req;

    const startTime = Date.now();
    res.on('finish', () => {
      const { statusCode } = res;
      let contentLength = res.get('content-length');
      contentLength = contentLength ? `${contentLength}B - ` : '';

      let logMessage = `${ip} | ${method} ${originalUrl} ${statusCode} - ${contentLength}${Date.now() - startTime}ms`;

      if (['POST', 'PUT'].includes(method)) {
        logMessage += `\nBODY: ${JSON.stringify(req.body)}`;
      }

      console.log(logMessage);
    });

    next();
  }
}
