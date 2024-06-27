import { CursorQueryDto } from "../dto/pagination";
import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export abstract class CursorQueryA extends CursorQueryDto {
  
}