import { CursorQueryDto } from "../dto/pagination";
import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export default abstract class CursorQueryA extends CursorQueryDto {
  
}