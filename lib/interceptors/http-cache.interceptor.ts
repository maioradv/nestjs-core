import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlContextType } from "@nestjs/graphql";
import { Request } from "express";
import { CACHE_DISABLED_KEY } from "../decorators";

export const API_CACHE_CONTROL_HEADER = 'x-api-cache-control'
export enum ApiCacheControl {
  noCache = 'no-cache'
}

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    if(context.getType<GqlContextType>() === 'graphql') return false

    const cacheDisabled = this.reflector.getAllAndOverride<boolean>(CACHE_DISABLED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if(cacheDisabled) return false;

    const req:Request = context.switchToHttp().getRequest()
    if(req.headers[API_CACHE_CONTROL_HEADER] === ApiCacheControl.noCache) return false
    return super.isRequestCacheable(context)
  }
}
