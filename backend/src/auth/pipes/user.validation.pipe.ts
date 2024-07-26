import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.type === 'body' && metadata.metatype) {
      const obj = plainToClass(metadata.metatype, value);
      const errors = await validate(obj);

      if (errors.length > 0) {
        // const formattedErrors = errors.map((error) => {
        //   const constraints = Object.values(error.constraints);
        //   //console.log(error);
        //   return { [error.property]: constraints[0] };
        // });
        console.log(errors[0]);
        throw new BadRequestException({
          message: errors[0].constraints[Object.keys(errors[0].constraints)[0]],
          error: 'Bad Request',
          statusCode: 400,
        });
      }
    }
    return value;
  }
}
