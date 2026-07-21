import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class BulkResponse {
  @ApiProperty()
  @Field(() => Int)
  count: number;
}