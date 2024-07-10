import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";

export const BooleanTransform = (

) => {
  return applyDecorators(
    Transform(({value}:{value:string}) => {
      return value === 'true' ? true : 
        value === 'false' ? false : 
        value === '1' ? true :
        value === '0' ? false :
        value ? true : false
    }),
  );
};