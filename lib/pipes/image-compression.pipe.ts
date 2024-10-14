import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import sharp from 'sharp';
import { LoggerFactory } from '../logger';

@Injectable()
export class ImageCompressionPipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  private readonly logger = LoggerFactory(this.constructor.name);

  async transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    try {
      const compressedBuffer = await sharp(file.buffer).webp({ 
        quality: 70,
      }).rotate().toBuffer()

      file.buffer = compressedBuffer
      file.mimetype = 'image/webp'
      file.size = compressedBuffer.length
      file.originalname = file.originalname.replace(extname(file.originalname), '.webp')

      return file

    } catch (error) {
      const {buffer,stream, ...log} = file
      this.logger.error(log)
      this.logger.error(error)
      throw new BadRequestException(`Error processing the image: ${error?.message}`);
    }
  }
}