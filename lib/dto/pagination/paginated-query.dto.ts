import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { PaginatedQueryI } from "./model";

export default class PaginatedQueryDto implements PaginatedQueryI {
  @ApiProperty({
    required:false,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page?:number = 1;

  @ApiProperty({
    required:false,
    minimum: 1,
    maximum: 250,
    default: 50,
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  @Type(() => Number)
  readonly limit?:number = 50;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}