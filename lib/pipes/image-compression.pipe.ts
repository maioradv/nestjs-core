import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import sharp from 'sharp';

export type CompressionOptions = {
  resolutionCap?:number,
  quality?:number
}

@Injectable()
export class ImageCompressionPipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  constructor(private readonly options:CompressionOptions = {}){}

  async transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    try {
      const meta = await sharp(file.buffer).metadata();

      const defaultQuality = this.defaultQuality(meta.width, meta.height);
      
      const [resolutionCap,quality] = [
        this.options.resolutionCap ?? 2560,
        this.options.quality ?? defaultQuality
      ]

      const compressedBuffer = await sharp(file.buffer,{failOn:'error'})
      .resize({
        width: resolutionCap,
        height: resolutionCap,
        fit: 'inside',
        withoutEnlargement:true
      })
      .withMetadata()
      .webp({ quality: quality }) 
      .rotate()
      .toBuffer();

      file.buffer = compressedBuffer
      file.mimetype = 'image/webp'
      file.size = compressedBuffer.length
      file.originalname = file.originalname.replace(extname(file.originalname), '.webp').replaceAll(' ','-')

      return file

    } catch (error) {
      throw new BadRequestException(`Error processing the image: ${error?.message}`);
    }
  }

  private defaultQuality(width?:number, height?:number): number {
    if(!width || !height) return 70;
    const area = width * height;
    return area > 2e6 ? 50 : area > 1e6 ? 60 : 70;
  }
}