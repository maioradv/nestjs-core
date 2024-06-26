import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';

const SALT_ROUNDS = 10
const _S_ = '::'
const SALT = 'basicsaltgeneralpurpose'

@Injectable()
export class CryptService {
  constructor(private readonly configService:ConfigService){}

  public async hash(word:string): Promise<string> {
    return bcrypt.hash(word,SALT_ROUNDS)
  }

  public async hashCompare(word:string,hash:string): Promise<boolean> {
    return bcrypt.compare(word,hash)
  }

  public async encrypt(word:string,salt:string = SALT): Promise<string> {
    const PASSPHRASE = this.configService.get('CRYPT_PASSPHRASE')
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(PASSPHRASE, salt, 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([
      cipher.update(word),
      cipher.final(),
    ]);
    return encryptedText.toString('hex') + _S_ + iv.toString('hex')
  }

  public async decrypt(str:string,salt:string = SALT): Promise<string> {
    const PASSPHRASE = this.configService.get('CRYPT_PASSPHRASE')
    const [encryptedText,ivs] = str.split(_S_) 
    const iv = Buffer.from(ivs,'hex')
    const buffer = Buffer.from(encryptedText,'hex')
    const key = (await promisify(scrypt)(PASSPHRASE, salt, 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([
      decipher.update(buffer),
      decipher.final(),
    ]);
    return decryptedText.toString('utf-8')
  }
}