import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { Int, Field, ArgsType } from '@nestjs/graphql';

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
      id: 'asc'
    }
  }

  get cursor() {
    return this.after || this.before ? {
      id: this.after ?? this.before
    } : undefined
  }
}