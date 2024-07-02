import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWSConfig } from "../config/aws.config";
import { createHash } from "crypto";
import sizeOf from 'image-size'

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
    let fileName = `${this.randomString(6)}-${file.originalname}`
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
    const size = sizeOf(file.buffer)
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
  }

  public async removeFile(fileName: string) {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: this.sdkConfigs.bucketName,
        Key: `${this.sdkConfigs.folder}/${fileName}`,
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