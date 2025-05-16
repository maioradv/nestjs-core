import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";

export const DEFAULT_MAX_IMAGE_SIZE = 10;
//heic uploaded as application/octet-stream
export const DEFAULT_MIMETYPES_SUPPORT = /^image\/(webp|avif|png|gif|jpe?g)$/

export type ImagePipeValidatorOptions = {
  maxSize?:number;
  mimeTypes?:('webp'|'avif'|'png'|'gif'|'jpeg'|'jpg')[]
}

export const ImagePipeValidator = (options?:ImagePipeValidatorOptions) => new ParseFilePipeBuilder()
  .addFileTypeValidator({ 
    fileType: options?.mimeTypes ? new RegExp(`^image\\/(${options.mimeTypes.join("|")})$`) : DEFAULT_MIMETYPES_SUPPORT,  
    //skipMagicNumbersValidation: true
  })
  .addMaxSizeValidator({ 
    maxSize: ( options?.maxSize ?? DEFAULT_MAX_IMAGE_SIZE ) * 1e6 
  })
  .build({ 
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY 
  })