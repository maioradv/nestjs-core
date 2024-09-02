import { AccountsApiConfigs } from "@maioradv/accounts-lib"

export type MaiorConfig = {
  accounts?:AccountsApiConfigs,
  smtp?:SmtpConfig
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