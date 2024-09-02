import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, SentMessageInfo, Transporter } from "nodemailer";
import { SmtpConfig } from "../config";

/** From email as email or ['From Name',email] 
  * @example user@email.com
  * @example ['User Name','user@email.com']
*/
export type MailingAddress = string | [string,string]
export type ReceiverAddress = MailingAddress[]

@Injectable()
export class MailerService {
  public readonly client:Transporter<SentMessageInfo>;
  private sdkConfigs:SmtpConfig;

  constructor(private readonly config:ConfigService){
    this.sdkConfigs = this.config.get<SmtpConfig>('maior.smtp')
    this.client = createTransport({
      ...this.sdkConfigs
    });
  }

  async sendMail({
    from,
    to,
    subject,
    html,
    text,
  }:{
    from:MailingAddress,
    to:ReceiverAddress,
    subject:string,
    html:string,
    text?:string
  }): Promise<void> {
    
    return this.client.sendMail({
      from: Array.isArray(from) ? `"${from[0]}" <${from[1]}>` : from,
      to: to.map(a =>  Array.isArray(a) ? `"${a[0]}" <${a[1]}>` : a).join(', '),
      subject,
      text,
      html,
    });
  }
}