import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import sharp from 'sharp';

@Injectable()
export class ImageCompressionPipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  async transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    try {
      const compressedBuffer = await sharp(file.buffer).webp({ 
        quality: 80,
      }).toBuffer()

      file.buffer = compressedBuffer
      file.mimetype = 'image/webp'
      file.size = compressedBuffer.length
      file.originalname = file.originalname.replace(extname(file.originalname), '.webp')

      return file

    } catch (error) {
      throw new BadRequestException('Error processing the image');
    }
  }
}