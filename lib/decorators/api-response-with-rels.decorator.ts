import { Type, applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, ApiResponseMetadata, getSchemaPath } from "@nestjs/swagger";
import { WithRequired } from "../utils/types.helper";
import { ReferenceObject, SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export type TModel = Type<any> | [string,Type<any>]
export type RelationDefs = {
  oneToOne?: TModel[],
  oneToMany?: TModel[],
  manyToMany?: [TModel,TModel|TModel[]][],
}

export type ApiReponseWithRelsOptions = WithRequired<ApiResponseMetadata,'type'>

export const ApiResponseWithRels = (
  options: ApiReponseWithRelsOptions,
  relations: RelationDefs
) => {
  const {type, ...rest} = options
  const Model = type as Type<any> 
  const {properties,extraModels} = handleRelationsForSwagger(relations)
  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiResponse({
      ...rest,
      schema:{
        title: `${Model.name}`,
        allOf: [
          { $ref: getSchemaPath(Model) },
          {
            properties:properties
          }
        ],
      }
    }),
  );
};

export function handleRelationsForSwagger(relations: RelationDefs): {
  properties:Record<string,SchemaObject | ReferenceObject>,
  extraModels:Type<any>[]
} {
  let properties:Record<string,SchemaObject | ReferenceObject> = {}
  let extraModels:Type<any>[] = []
  relations.oneToMany?.forEach((T) => {
    const [name,schema] = Array.isArray(T) ? T : [T.name,T]
    properties[`${name}`] = {
      type:'array',
      items: { $ref: getSchemaPath(schema) }
    }
    extraModels.push(schema)
  })
  relations.oneToOne?.forEach((T) => {
    const [name,schema] = Array.isArray(T) ? T : [T.name,T]
    properties[`${name}`] = { $ref: getSchemaPath(schema) }
    extraModels.push(schema)
  })
  relations.manyToMany?.forEach((TCouple) => {
    const [T,S] = TCouple
    const [name,schema] = Array.isArray(T) ? T : [T.name,T]
    const models = Array.isArray(S) ? S : [S]
    let rels:Record<string,SchemaObject | ReferenceObject> = {}
    models.forEach(M => {
      const [name,schema] = Array.isArray(M) ? M : [M.name,M]
      rels[`${name}`] = { $ref: getSchemaPath(schema) }
      extraModels.push(schema)
    })
    properties[`${name}`] = {
      type:'array',
      items: { $ref: getSchemaPath(schema), properties:rels }
    }
    extraModels.push(schema)
  })
  return {properties,extraModels}
}