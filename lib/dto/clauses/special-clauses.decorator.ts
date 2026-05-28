import { applyDecorators, BadRequestException } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsOptional } from "class-validator";
import { MetadataOperator, MetadataOperators, MetadataFilter } from "@maioradv/types";

export const IsMetafieldClause = () => {
  return applyDecorators(
    ApiPropertyOptional({
      type: String,
      description: 'A key:value couple or a comma-separated list of couples. Format: key1:value1,key2:,:value3,:'
    }),
    Transform(({ value }: { value: string }) => 
      value.split(',').map(pair => {
        const [key, val] = pair.split(':');
        const obj: Record<string, string> = {};
        if (key?.trim()) obj.key = key.trim();
        if (val?.trim()) obj.value = val.trim();
        return obj;
      })
    ),
    IsOptional(),
    IsArray(),
  );
};

export const IsTranslationClause = () => {
  return applyDecorators(
    ApiPropertyOptional({
      type: String,
      description: 'A key:locale:value tuple or a comma-separated list of tuples. Format: key1:locale1:value1,key2:locale2:value2'
    }),
    Transform(({ value }: { value: string }) => 
      value.split(',').map(pair => {
        const [key, locale, val] = pair.split(':');
        const obj: Record<string, string> = {};
        if (key?.trim()) obj.key = key.trim();
        if (locale?.trim()) obj.locale = locale.trim();
        if (val?.trim()) obj.value = val.trim();
        return obj;
      })
    ),
    IsOptional(),
    IsArray(),
  );
};

const parseValue = (raw: string): unknown => {
  const trimmed = raw?.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  const num = Number(trimmed);
  if (!Number.isNaN(num) && trimmed !== '') return num;

  return trimmed;
};

const allowedOperators = new Set<string>(MetadataOperators);

const getMetadataClauseErrors = (item: MetadataFilter | null | undefined, index: number, property: string): string[] => {
  if (!item) return [`${property}[${index}] is invalid`];

  const errors: string[] = [];
  const hasPath = Array.isArray(item.path) && item.path.some(part => part.trim().length > 0);
  const hasValue = item.value !== undefined && item.value !== '';

  if (!hasPath) errors.push(`${property}[${index}].path must not be empty`);
  if (!allowedOperators.has(item.operator)) {
    errors.push(`${property}[${index}].operator must be one of: ${MetadataOperators.join(', ')}`);
  }
  if (!hasValue) errors.push(`${property}[${index}].value must not be empty`);

  return errors;
};

export const IsMetadataClause = () => {
  return applyDecorators(
    ApiPropertyOptional({
      type: String,
      description:'Metadata filter format: path:operator:value, multiple with ,. Example: user.id:equals:1,tags:array_contains:vip',
    }),
    Transform(({ value, key }: { value: string, key: string }) => {
      if (!value) return [];

      const clauses = value
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
        .map(clause => {
          const [rawPath, rawOperator, ...rawValue] = clause.trim().split(':');
          const path = rawPath?.trim()
          const operator = rawOperator?.trim();
          const value = rawValue.join(':').trim()
          const isNull = ((operator === 'equals' || operator === 'not') && value === 'null') ? true : false
          return {
            path: path.split('.'),
            operator:operator as MetadataOperator,
            value: (isNull ? null : parseValue(value)) as (string|number|boolean|null)
          } as MetadataFilter;
        });

      const errors = clauses.flatMap((item, index) => getMetadataClauseErrors(item, index, key));
      if (errors.length) throw new BadRequestException(errors);

      return clauses;
    }),
    IsOptional(),
    IsArray(),
  );
};
