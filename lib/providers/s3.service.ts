import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { AWSConfig } from "../config/aws.config";
import { createHash } from "crypto";
import { imageSize as sizeOf } from 'image-size'
import 'multer';
import { LoggerFactory } from "../logger";
import path from "path";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

export type UploadImageResponse = {
  src:string;
  height:number;
  width:number;
  checksum:string;
  fileName:string;
  mimeType:string;
  size:number;
}

export type S3ServiceOptions = {
  bucket?:string,
  folder?:string,
  limit?:number
}

@Injectable()
export class S3Service {
  public readonly client:S3Client;
  private sdkConfigs:AWSConfig['s3sdk'];
  private readonly logger = LoggerFactory(this.constructor.name);

  constructor(private readonly config:ConfigService){
    this.sdkConfigs = this.config.get<AWSConfig['s3sdk']>('aws.s3sdk')
    this.client = new S3Client({
      region:this.sdkConfigs.region,
      credentials:{
        accessKeyId:this.sdkConfigs.accessKeyId,
        secretAccessKey:this.sdkConfigs.secretAccessKey
      }
    })
  }

  public async uploadImage(file: Express.Multer.File,opts:S3ServiceOptions = {}): Promise<UploadImageResponse> {
    try {
      const {Bucket,Prefix} = this.getOptions(opts)
      let fileName = `${this.randomString(6)}-${file.originalname}`
      /*try {
        const check = await this.client.send(
          new HeadObjectCommand({
            Bucket, 
            Key: `${Prefix}/${fileName}`,
          })
        )
        if(check) fileName = `${this.randomString(5)}-${fileName}`
      } catch(e) {}*/
      const response = await this.client.send(
        new PutObjectCommand({
          Bucket,
          Key: `${Prefix}/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype
        })
      );
      const size = sizeOf(file.buffer)
      const checksum = createHash('md5').update(file.buffer).digest("base64");
      return {
        src:`${this.sdkConfigs.baseUrl}/${Prefix}/${fileName}`,
        width: size.width,
        height: size.height,
        checksum: checksum,
        fileName: fileName,
        mimeType: file.mimetype,
        size: file.size
      }
    } catch(e) {
      this.logger.error(e)
      throw e
    }
  }

  public async removeFile(fileName: string,opts:S3ServiceOptions = {}) {
    const {Bucket,Prefix} = this.getOptions(opts)
    return this.client.send(
      new DeleteObjectCommand({
        Bucket,
        Key: `${Prefix}/${fileName}`,
      })
    )
  }

  public async listFiles(opts:S3ServiceOptions = {}) {
    const {Bucket,Prefix} = this.getOptions(opts)
    return this.client.send(
      new ListObjectsCommand({
        Bucket,
        Prefix,
        MaxKeys: opts.limit
      })
    )
  }

  public async removeFiles(keys:string[],opts:S3ServiceOptions = {}) {
    const {Bucket,Prefix} = this.getOptions(opts)
    return this.client.send(
      new DeleteObjectsCommand({
        Bucket,
        Delete: {
          Objects:keys.map(k => ({
            Key:k
          }))
        }
      })
    )
  }

  public async clearAll(opts:S3ServiceOptions = {}) {
    const {Bucket,Prefix} = this.getOptions(opts)
    const paginator = paginateListObjectsV2(
      { client:this.client },
      {
        Bucket,
        Prefix,
      },
    );

    const objectKeys = [];
    for await (const { Contents } of paginator) {
      if(Contents && Contents.length > 0) objectKeys.push(...Contents.map((obj) => ({ Key: obj.Key })));
    }

    if(objectKeys.length == 0) return;

    return this.client.send(
      new DeleteObjectsCommand({
        Bucket,
        Delete: {
          Objects:objectKeys
        }
      })
    )
  }

  private randomString(length:number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async backup(destDir: string, opts:S3ServiceOptions = {}) {
    const {Bucket,Prefix} = this.getOptions(opts)
    const paginator = paginateListObjectsV2(
      { client: this.client },
      {
        Bucket,
        Prefix,
      },
    );

    for await (const page of paginator) {
      for (const obj of page.Contents ?? []) {
        const key = obj.Key!;
        if (key.endsWith('/')) continue;

        const localPath = path.join(destDir, key.slice(Prefix.length));
        await mkdir(path.dirname(localPath), { recursive: true });

        const { Body } = await this.client.send(
          new GetObjectCommand({ Bucket, Key: key }),
        );
        await pipeline(Body as Readable, createWriteStream(localPath));
      }
    }
  }

  private getOptions(opts:S3ServiceOptions = {}) {
    return {
      Bucket: opts.bucket ?? this.sdkConfigs.bucketName,
      Prefix: opts.folder ?? this.sdkConfigs.folder
    }
  }
}
