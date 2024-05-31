export interface PaginatedQueryI {
  readonly page?:number;
  readonly limit?:number;

  get skip(): number;
  get take(): number;
} 