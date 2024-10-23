import { mw } from 'request-ip'

export const ClientIp = () => mw({
  attributeName:'ip'
})