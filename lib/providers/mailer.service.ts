import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, SentMessageInfo, Transporter } from "nodemailer";
import { SmtpConfig } from "../config";

export type MailingAddress = string | [string,string]
export type ReceiverAddress = string | string[]

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
    /** From email as email or ['From Name',email] 
      * @example 'user@email.com'
      * @example ['User Name','user@email.com']
    */
    from:MailingAddress,
    /** From email as email or ['From Name',email] 
      * @example 'user@email.com'
      * @example ['user1@email.com','user2@email.com']
    */
    to:ReceiverAddress,
    subject:string,
    html:string,
    text?:string
  }): Promise<void> {
    
    return this.client.sendMail({
      from: Array.isArray(from) ? `"${from[0]}" <${from[1]}>` : from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
    });
  }
}