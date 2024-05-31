import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if(host.getType<GqlContextType>() === 'graphql') {
      return exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const data = process.env.NODE_ENV == 'development' ? {
      statusCode: status,
      method: request.method,
      path: request.url,
      type: exception.name,
      message: exception.message,
      stack: exception.stack?.split('\n')
    } : {
      statusCode: status,
      message: exception.message,
    }
   
    response
      .status(status)
      .send(data);
  }
}