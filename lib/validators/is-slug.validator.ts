import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message:`${propertyName} must be a valid slug`,
        ...(validationOptions ?? {})
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regex = /^[a-z0-9-]+$/;
          return typeof value === 'string' && regex.test(value) && value.length > 2;
        },
      },
    });
  };
}