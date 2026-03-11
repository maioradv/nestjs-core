import { applyDecorators, Type as TypeI } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";

export const IsMetafieldClause = <T>(dto: TypeI<T>) => {
  return applyDecorators(
    ApiPropertyOptional({
      type:String,
      description: 'A key:value couple or a comma-separated list of couples. Format: key1:value1,key2:value2'
    }),
    Transform(({ value }: { value: string }) => 
      plainToInstance(dto, value.split(',').map(pair => {
        const [key, val] = pair.split(':');
        return { key: key.trim(), value: val.trim() };
      }))
    ),
    IsOptional(),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => dto)
  );
};