import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";

export const DEFAULT_MAX_IMAGE_SIZE = 10;
export const DEFAULT_MIMETYPES_SUPPORT = '.(webp|avif|png|gif|jpeg|jpg|heic|heif|hevc)$/i'

export type ImagePipeValidatorOptions = {
  maxSize?:number;
  mimeTypes?:('webp'|'avif'|'png'|'gif'|'jpeg'|'jpg'|'heic'|'heif'|'hevc')[]
}

export const ImagePipeValidator = (options?:ImagePipeValidatorOptions) => new ParseFilePipeBuilder()
.addFileTypeValidator({ fileType: options?.mimeTypes ? `.(${options.mimeTypes.join('|')})$/i` : DEFAULT_MIMETYPES_SUPPORT })
.addMaxSizeValidator({ maxSize: ( options?.maxSize ?? DEFAULT_MAX_IMAGE_SIZE ) * 1e6 })
.build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })