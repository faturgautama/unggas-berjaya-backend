// src/common/pipes/custom-validation.pipe.ts
import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;

        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value);
        const errors = await validate(object);

        if (errors.length > 0) {
            // flatten all error messages into array
            const message = errors
                .map(err => Object.values(err.constraints || {}))
                .flat();
            throw new BadRequestException({ status: false, message, data: null });
        }

        return object;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype) && this.hasValidationMetadata(metatype);
    }

    private hasValidationMetadata(metatype: Function): boolean {
        const validationMetadataKeys = Reflect.getMetadataKeys(metatype.prototype) || [];
        return validationMetadataKeys.some(k => k.toString().startsWith('class-validator:'));
    }
}
