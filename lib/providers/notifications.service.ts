import { notificationsApiClient, NotificationsApiClient, NotificationsApiConfigs, ApiHost } from "@maioradv/notifications-lib";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificationsService {
  client:NotificationsApiClient;
  constructor(private readonly configService:ConfigService){
    this.client = notificationsApiClient(this.configService.get<NotificationsApiConfigs>('maior.notifications') ?? { host: ApiHost.main })
  }
}