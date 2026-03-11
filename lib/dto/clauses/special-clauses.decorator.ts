import { applyDecorators, Type as TypeI } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";

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