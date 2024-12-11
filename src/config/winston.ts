import path from 'path';

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.simple(),
    winston.format.printf((info: any) => {
      if (info.stack) {
        return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}\n${info.stack}`;
      }
      return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    }),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.resolve('logs/logfile-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});
