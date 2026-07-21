import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

@ObjectType()
export class BulkOperation {
  @ApiProperty({type:'integer',isArray:true})
  @IsNotEmpty()
  @IsInt({each:true})
  @Field(() => [Int])
  ids: number[];
}