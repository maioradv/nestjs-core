import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsCommand, PutObjectCommand, S3Client, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { AWSConfig } from "../config/aws.config";
import { createHash } from "crypto";
import { imageSize as sizeOf } from 'image-size'
import { LoggerFactory } from "../logger";

export type UploadImageResponse = {
  src:string;
  height:number;
  width:number;
  checksum:string;
  fileName:string;
  mimeType:string;
  size:number;
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

  public async uploadImage(file: Express.Multer.File): Promise<UploadImageResponse> {
    try {
      let fileName = `${this.randomString(6)}-${file.originalname}`
      this.logger.log('randome',fileName)
      /*try {
        const check = await this.client.send(
          new HeadObjectCommand({
            Bucket: this.sdkConfigs.bucketName, 
            Key: `${this.sdkConfigs.folder}/${fileName}`,
          })
        )
        if(check) fileName = `${this.randomString(5)}-${fileName}`
      } catch(e) {}*/
      const response = await this.client.send(
        new PutObjectCommand({
          Bucket: this.sdkConfigs.bucketName,
          Key: `${this.sdkConfigs.folder}/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype
        })
      );
      this.logger.log('response',response)
      const size = sizeOf(file.buffer)
      this.logger.log('sizeof',size)
      const checksum = createHash('md5').update(file.buffer).digest("base64");
      return {
        src:`${this.sdkConfigs.baseUrl}/${this.sdkConfigs.folder}/${fileName}`,
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

  public async removeFile(fileName: string) {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: this.sdkConfigs.bucketName,
        Key: `${this.sdkConfigs.folder}/${fileName}`,
      })
    )
  }

  public async listFiles(opts:{limit?:number,folder?:string} = {}) {
    return this.client.send(
      new ListObjectsCommand({
        Bucket: this.sdkConfigs.bucketName,
        Prefix: opts.folder ?? this.sdkConfigs.folder,
        MaxKeys: opts.limit
      })
    )
  }

  public async removeFiles(keys:string[]) {
    return this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.sdkConfigs.bucketName,
        Delete: {
          Objects:keys.map(k => ({
            Key:k
          }))
        }
      })
    )
  }

  public async clearAll(opts:{folder?:string} = {}) {
    const paginator = paginateListObjectsV2(
      { client:this.client },
      {
        Bucket: this.sdkConfigs.bucketName,
        Prefix: opts.folder ?? this.sdkConfigs.folder,
      },
    );

    const objectKeys = [];
    for await (const { Contents } of paginator) {
      if(Contents && Contents.length > 0) objectKeys.push(...Contents.map((obj) => ({ Key: obj.Key })));
    }

    if(objectKeys.length == 0) return;

    return this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.sdkConfigs.bucketName,
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
}