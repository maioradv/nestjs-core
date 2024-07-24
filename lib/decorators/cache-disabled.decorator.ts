import { SetMetadata } from '@nestjs/common';

export const CACHE_DISABLED_KEY = 'cacheDisabled';
export const CacheDisabled = () => SetMetadata(CACHE_DISABLED_KEY, true);