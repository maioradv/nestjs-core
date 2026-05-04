import { AccountsApiConfigs } from "@maioradv/accounts-lib"
import { NotificationsApiConfigs } from "@maioradv/notifications-lib"

export type MaiorConfig = {
  accounts?:AccountsApiConfigs,
  smtp?:SmtpConfig,
  notifications?:NotificationsApiConfigs
}

export type SmtpConfig = {
  host: string,
  port: number,
  secure: boolean,
  auth: {
    user: string,
    pass: string,
  }
}

export const MaiorConfigKey = 'maior'