import { BadRequestException } from "@nestjs/common";

export const VALIDATION_EXCEPTION_CODE = 'VALIDATION_ERROR'

export class ValidationException extends BadRequestException {
  constructor(objectOrError?: any) {
    super(objectOrError,VALIDATION_EXCEPTION_CODE);
  }
}