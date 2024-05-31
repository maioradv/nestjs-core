import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import CursorMetaDto from './cursor-meta.dto'

interface IEdgeType<T> {
  cursor: string;
  node: T;
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[];
  nodes: T[];
  meta: CursorMetaDto;
}

export function PaginatedGQL<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => CursorMetaDto, { nullable: true })
    meta: CursorMetaDto;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}

export type CursorMeta = {
  first:number|undefined
  last:number|undefined
}

export class PaginatedGQLDto<T> implements IPaginatedType<T>{
  readonly edges: IEdgeType<T>[];
  readonly nodes: T[];
  readonly meta: CursorMetaDto;

  constructor(data: T[], meta: CursorMeta) {
    this.edges = this.getEdges(data)
    this.nodes = data
    this.meta = new CursorMetaDto({
      ...meta,
      start: +this.edges[0]?.cursor,
      end: +this.edges[this.edges.length-1]?.cursor
    })
  }

  private getEdges(data: T[]) {
    return data.map((value) => {
      return {
        node: value,
        cursor: (value as any).id,
      };
    });
  }
}