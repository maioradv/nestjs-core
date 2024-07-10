import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlContextType } from "@nestjs/graphql";
import { Request } from "express";

export const API_CACHE_CONTROL_HEADER = 'X-Api-Cache-Control'

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    if(context.getType<GqlContextType>() === 'graphql') return false
    const req:Request = context.switchToHttp().getRequest()
    return req.headers[API_CACHE_CONTROL_HEADER] === 'no-cache' ? false : true
  }
}
