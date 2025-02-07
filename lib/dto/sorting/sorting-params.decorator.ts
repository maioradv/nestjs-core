import { Type as TypeI, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiPropertyOptional, ApiQuery, getSchemaPath } from "@nestjs/swagger";
import { Transform, Type, plainToClass } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

export const ApiSortingParams = <TModel extends TypeI<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiQuery({
      required: false,
      name: 'sorting',
      style: 'simple', // deepObject
      //explode: true,
      description:`A json of ${model.name}`,
      type: 'string', //object
      example:'',
      //schema: { $ref: getSchemaPath(model) },
    })
  );
};

export const IsSortingObject = <TModel extends TypeI<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiPropertyOptional(),
    ValidateNested(),
    Transform(({value}) => plainToClass(model, JSON.parse(value))),
    Type(() => model),
    IsOptional()
  );
};