import { ApiProperty } from "@nestjs/swagger";
import PaginatedMetaDto from "./paginated-meta.dto";

export default class PaginatedDto<T> {
  @ApiProperty()
  readonly data: T[];

  @ApiProperty()
  readonly meta: PaginatedMetaDto;

  constructor(data: T[], meta: PaginatedMetaDto) {
    this.data = data
    this.meta = meta
  }
}