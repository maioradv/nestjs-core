import { DefaultClausesI, IsDateStringClause, IsMetafieldClause, IsNumberClause, IsTranslationClause } from "../dto/clauses";
import { PaginatedQueryDto } from "../dto/pagination";

export abstract class PaginatedQueryA extends PaginatedQueryDto implements DefaultClausesI {
  @IsNumberClause()
  id?:number[]

  @IsDateStringClause()
  createdAt?:Date

  @IsDateStringClause()
  updatedAt?:Date

  @IsDateStringClause()
  minCreatedAt?:Date

  @IsDateStringClause()
  maxCreatedAt?:Date

  @IsDateStringClause()
  minUpdatedAt?:Date

  @IsDateStringClause()
  maxUpdatedAt?:Date

  @IsMetafieldClause()
  metafields?: Record<string, string>[];

  @IsTranslationClause()
  translations?: Record<string, string>[];
}