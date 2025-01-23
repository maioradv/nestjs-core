import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Int, Field, ArgsType } from '@nestjs/graphql';
import { Sorting } from "../sorting";

@ArgsType()
export default class CursorQueryDto {
  @ApiProperty({
    required:false,
  })
  @Field(() => Int,{nullable:true})
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly after?:number;

  @ApiProperty({
    required:false,
  })
  @Field(() => Int,{nullable:true})
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly before?:number;

  @ApiProperty({
    required:false,
    minimum: 1,
    maximum: 250,
    default: 50,
  })
  @Field(() => Int,{nullable:true})
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  @Type(() => Number)
  readonly limit?:number = 50;

  @ApiProperty({
    required:false,
    enum:Sorting,
    default: Sorting.asc,
  })
  @Field({nullable:true})
  @IsString()
  @IsEnum(Sorting)
  @IsOptional()
  readonly sorting?:Sorting = Sorting.asc

  get skip(): number {
    if(this.after || this.before) return 1;
    return 0;
  }

  get take(): number {
    if(this.before) return -this.limit;
    return this.limit;
  }

  get order():Record<string,any> {
    return {
      id: this.sorting
    }
  }

  get cursor() {
    return this.after || this.before ? {
      id: this.after ?? this.before
    } : undefined
  }
}