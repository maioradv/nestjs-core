import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class SlugCheckResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  input:string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  output:string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  available:boolean;
}