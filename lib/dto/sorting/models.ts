import { IsEnum, IsOptional } from 'class-validator';
import { Sorting } from './enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SortingDto implements DefaultSortingI {
  @ApiPropertyOptional({enum: Sorting})
  @IsEnum(Sorting)
  @IsOptional()
  id?: Sorting;

  @ApiPropertyOptional({enum: Sorting})
  @IsEnum(Sorting)
  @IsOptional()
  createdAt?: Sorting;

  @ApiPropertyOptional({enum: Sorting})
  @IsEnum(Sorting)
  @IsOptional()
  updatedAt?: Sorting;

  get orderBy() {
    return Object.entries(this).map(entry => {
      return {[entry[0]]: entry[1]};
    });
  }
}

export interface DefaultSortingI {
  id?: Sorting;
  createdAt?: Sorting;
  updatedAt?: Sorting;
  get orderBy();
}

export interface SortingQueryI<T extends SortingDto> {
  sorting?:T
}

export type SortingFieldsOf<T, P extends keyof T = Exclude<keyof T,keyof DefaultSortingI | 'metafields' | 'translations'>> = {
  [K in P]?: Sorting
}