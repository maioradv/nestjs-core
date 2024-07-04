export type AWSConfig = {
  s3sdk?:{
    region:string,
    bucketName:string,
    accessKeyId:string,
    secretAccessKey:string,
    folder:string,
    baseUrl:string
  }
}

export const AWSConfigKey = 'aws'