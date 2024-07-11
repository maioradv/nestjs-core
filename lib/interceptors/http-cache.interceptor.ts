import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlContextType } from "@nestjs/graphql";
import { Request } from "express";

export const API_CACHE_CONTROL_HEADER = 'x-api-cache-control'
export enum ApiCacheControl {
  noCache = 'no-cache'
}

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    if(context.getType<GqlContextType>() === 'graphql') return false
    const req:Request = context.switchToHttp().getRequest()
    if(req.headers[API_CACHE_CONTROL_HEADER] === ApiCacheControl.noCache) return false
    return super.isRequestCacheable(context)
  }
}
