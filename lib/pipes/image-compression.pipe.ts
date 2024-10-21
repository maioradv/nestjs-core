import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import sharp from 'sharp';
import { LoggerFactory } from '../logger';

@Injectable()
export class ImageCompressionPipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  //private readonly logger = LoggerFactory(this.constructor.name);

  async transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    try {
      /*const compressedBuffer = await sharp(file.buffer).webp({ 
        quality: 70,
      }).rotate().toBuffer()*/

      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      const compressedBuffer = await image
      .resize({
        width: metadata.width > metadata.height ? 1920 : null,
        height: metadata.height > metadata.width ? 1920 : null,
        fit: 'inside',
      })
      .withMetadata() // Mantieni il profilo colore e i metadati dell'immagine originale
      .webp({ quality: 90 }) // Alta qualità per mantenere la nitidezza
      .rotate()
      .toBuffer();


      /*const thumbnailBuffer = await sharp(file.buffer)
      .resize({
        width: 128,
        height: 300,
        fit: 'cover', // Ritaglia l'immagine per adattarsi a 128x300 mantenendo le proporzioni
        position: 'center', // Centra l'immagine durante il ritaglio
      })
      .webp({ quality: 70 })
      .toBuffer();*/

      file.buffer = compressedBuffer
      file.mimetype = 'image/webp'
      file.size = compressedBuffer.length
      file.originalname = file.originalname.replace(extname(file.originalname), '.webp').replaceAll(' ','-')

      return file

    } catch (error) {
      /*const {buffer,stream, ...log} = file
      this.logger.error(log)
      this.logger.error(error)*/
      throw new BadRequestException(`Error processing the image: ${error?.message}`);
    }
  }
}