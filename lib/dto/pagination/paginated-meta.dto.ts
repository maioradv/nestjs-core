import { ApiProperty } from "@nestjs/swagger";
import PaginatedQueryDto from "./paginated-query.dto";

export default class PaginatedMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ 
    paginatedQueryDto, 
    itemCount 
  }:{ 
    paginatedQueryDto: PaginatedQueryDto,
    itemCount: number
  }) {
    this.page = paginatedQueryDto.page;
    this.take = paginatedQueryDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}