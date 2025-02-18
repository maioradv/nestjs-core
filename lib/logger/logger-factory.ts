import { LoggerService } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions, utilities } from 'nest-winston';
import { format, transports } from 'winston';
import DailyRotateFile from "winston-daily-rotate-file";
import { joinFromRoot } from '../utils';

export const LoggerFactory = (appName: string): LoggerService => {
  return WinstonModule.createLogger(LoggerFactoryOptions(appName))
}

export const LoggerFactoryOptions = (appName:string): WinstonModuleOptions => {
  const relativePath = `../logs/${appName}`
  return {
    transports: [
      new DailyRotateFile({
        filename: joinFromRoot(relativePath,`%DATE%-error.log`), 
        level: 'error',
        format: format.combine(format.timestamp({format:'YYYY-MM-DDTHH:mm:ssZZ'}), format.ms(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: 30,
      }),
      new DailyRotateFile({
        filename: joinFromRoot(relativePath,`%DATE%-combined.log`),
        format: format.combine(format.timestamp({format:'YYYY-MM-DDTHH:mm:ssZZ'}), format.ms(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: 30,
      }),
      new transports.Console({
        level:'debug',
        format: format.combine(
          format.timestamp(),
          format.ms(),
          utilities.format.nestLike(appName, {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    ],
  }
}