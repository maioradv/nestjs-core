import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    if(host.getType<GqlContextType>() === 'graphql') {
      return exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const data = process.env.NODE_ENV == 'development' ? {
      statusCode: status,
      method: request.method,
      path: request.url,
      type: exception.name,
      code: exception.code,
      message: exception.message ?? 'Internal Server Error',
      stack: exception.stack?.split('\n')
    } : {
      statusCode: status,
      message: exception.message ?? 'Internal Server Error',
    }
    
    response
      .status(status)
      .send(data);
  }
}