import { applyDecorators, Type as TypeI } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export const IsStringClause = (

) => {
  return applyDecorators(
    ApiPropertyOptional({
      type:String,
      description:'Check if field contains the string'
    }),
    IsOptional(),
    IsString()
  );
};

export const IsEnumClause = (
  model: object,
) => {
  return applyDecorators(
    ApiPropertyOptional({
      enum:model,
      description:'A string or a comma-separated list of strings'
    }),
    Transform(({value}:{value:string}) => value.split(',')),
    IsOptional(),
    IsEnum(model,{each:true}),
    IsArray()
  );
};

export const IsNumberClause = (

) => {
  return applyDecorators(
    ApiPropertyOptional({
      type:Number,
      description:'A number or a comma-separated list of numbers'
    }),
    Transform(({value}:{value:string}) => value.split(',').map(str => +str)),
    IsOptional(),
    IsNumber({allowNaN:false},{each: true}),
    IsArray()
  );
};

export const IsBooleanClause = (

  ) => {
    return applyDecorators(
      ApiPropertyOptional({
        type:Boolean,
      }),
      Transform(({value}:{value:string}) => {
        return value === 'true' ? true : 
          value === 'false' ? false : 
          value === '1' ? true :
          value === '0' ? false :
          value ? true : false
      }),
      IsOptional(),
      IsBoolean()
    );
  };

export const IsDateStringClause = (
  
) => {
  return applyDecorators(
    ApiPropertyOptional({
      type:Date,
      description:'A date string in ISO8601 format',
    }),
    Type(() => Date),
    IsOptional(),
    IsDate()
  );
};