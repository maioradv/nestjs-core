import { HttpStatus, Type, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiResponseOptions, getSchemaPath } from "@nestjs/swagger";
import PaginatedMetaDto from "./paginated-meta.dto";
import PaginatedDto from "./paginated.dto";
import { RelationDefs, handleRelationsForSwagger } from "../../decorators";

const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  relations?:RelationDefs,
  options?: ApiResponseOptions,
) => {
  const {properties,extraModels} = relations ? handleRelationsForSwagger(relations) : {properties:undefined,extraModels:[]}
  return applyDecorators(
    ApiExtraModels(PaginatedMetaDto, PaginatedDto, model, ...extraModels),
    ApiOkResponse({
      status:HttpStatus.OK,
      description:`${model.name}s`,
      schema: {
        title: `Paginated${model.name}Dto`,
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              data: {
                
                type: 'array',
                items: { 
                  title:`${model.name}s`,
                  allOf:[
                    { $ref: getSchemaPath(model) },
                    {
                      properties:properties
                    }
                  ]
                },          
              },
              meta: {
                $ref: getSchemaPath(PaginatedMetaDto)
              },
            },
          },
        ],
      },
      ...options
    }),
  );
};

export default ApiPaginatedResponse