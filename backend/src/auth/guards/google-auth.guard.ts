import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  handleRequest(err, user, info, context: ExecutionContext) {
    // const request = context.switchToHttp().getRequest();
    // const response = context.switchToHttp().getResponse();

    // if (request.query && request.query.error) {
    //   // Handle the error (e.g., access_denied) and redirect appropriately
    //   return response.redirect('${process.env.FRONT}/login');
    // }

    // if (err || !user) {
    //   throw err || new UnauthorizedException('sklfjdsklfkldsjfkldjsf');
    // }
    return user;
  }
}
