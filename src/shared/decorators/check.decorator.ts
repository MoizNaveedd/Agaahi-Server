import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function Check(
  property: (current: any, object: any) => boolean,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'check',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [customCheckerFn] = args.constraints;
          return customCheckerFn(value, args.object);
        },
        defaultMessage() {
          return `Validation failed on property $property`;
        },
      },
    });
  };
}