import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";

export type BooleanTransformOptions = {
  nullPassthrough?: boolean;
}

export const BooleanTransform = (
  options: BooleanTransformOptions = {},
) => {
  return applyDecorators(
    Transform(({value}:{value:string}) => {
      if (options.nullPassthrough && value === null) {
        return null;
      }
      return value === 'true' ? true : 
        value === 'false' ? false : 
        value === '1' ? true :
        value === '0' ? false :
        value ? true : false
    }),
  );
};