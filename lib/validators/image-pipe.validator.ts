import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";

export const DEFAULT_MAX_IMAGE_SIZE = 2;
export const DEFAULT_MIMETYPES_SUPPORT = '.(webp|avif|png|gif|jpeg|jpg)'

export type ImagePipeValidatorOptions = {
  maxSize?:number;
  mimeTypes?:('webp'|'avif'|'png'|'gif'|'jpeg'|'jpg')[]
}

export const ImagePipeValidator = (options?:ImagePipeValidatorOptions) => new ParseFilePipeBuilder()
.addFileTypeValidator({ fileType: options?.mimeTypes ? `.(${options.mimeTypes.join('|')})` : DEFAULT_MIMETYPES_SUPPORT })
.addMaxSizeValidator({ maxSize: ( options?.maxSize ?? DEFAULT_MAX_IMAGE_SIZE ) * 8e6 })
.build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })