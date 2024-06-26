import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RemoveGQL {
  @Field(() => Int)
  count: number;
}