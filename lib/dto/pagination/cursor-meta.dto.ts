import { ApiProperty } from "@nestjs/swagger";
import { Field, ObjectType, Int } from '@nestjs/graphql'

@ObjectType()
export default class CursorMetaDto {
  @ApiProperty()
  @Field(() => Int,{ nullable: true })
  readonly startCursor: number;

  @ApiProperty()
  @Field(() => Int,{ nullable: true })
  readonly endCursor: number; 

  @ApiProperty()
  @Field()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  @Field()
  readonly hasNextPage: boolean;

  constructor({ 
    first,
    last,
    start,
    end 
  }:{ 
    first: number|undefined,
    last: number|undefined,
    start: number|undefined,
    end: number|undefined,
  }) {
    if(start) this.startCursor = start;
    if(end) this.endCursor = end;
    this.hasPreviousPage = start ? (start !== first) : false
    this.hasNextPage = end ? (end !== last) : false
  }
}