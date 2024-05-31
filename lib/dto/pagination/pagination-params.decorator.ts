import { Type, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiQuery, getSchemaPath } from "@nestjs/swagger";
import PaginatedQueryDto from "./paginated-query.dto";

const ApiPaginationParams = <TModel extends Type<any>>() => {
  return applyDecorators(
    ApiExtraModels(PaginatedQueryDto),
    ApiQuery({
      required: false,
      name: 'pagination',
      style: 'deepObject',
      explode: true,
      type: 'object',
      schema: {
        $ref: getSchemaPath(PaginatedQueryDto),
      },
    })
  );
};

export default ApiPaginationParams