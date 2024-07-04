import { AccountsApiClient, AccountsApiConfigs, accountsApiClient } from "@maioradv/accounts-lib";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AccountsService {
  client:AccountsApiClient;
  constructor(private readonly configService:ConfigService){
    this.client = accountsApiClient(this.configService.get<AccountsApiConfigs>('maior.accounts') ?? {})
  }
}