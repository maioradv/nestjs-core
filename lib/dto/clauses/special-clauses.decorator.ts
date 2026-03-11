import { applyDecorators, Type as TypeI } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class MetafieldClauseDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export const IsMetafieldClause = () => {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'A key:value couple or a comma-separated list of couples. Format: key1:value1,key2:value2'
    }),
    Transform(({ value }: { value: string }) => 
      value.split(',').map(pair => {
        const [key, value] = pair.split(':');
        return { key: key.trim(), value: value.trim() };
      })
    ),
    IsOptional(),
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => MetafieldClauseDto)
  );
};