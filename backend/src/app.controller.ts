import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Res,
  Req,
  Redirect,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Public } from './auth/decorators/public.decorator';
import { FortyTwoGuard } from './auth/guards/forty-two-auth.guard';
import { CreateUserDto } from './users/dto/create-user.dto';
import { CustomValidationPipe } from './auth/pipes/user.validation.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @UseGuards(LocalAuthGuard)
  // @Public()
  //   @Post('auth/signup')
  //   async signup(@Body() user, @Req() req, @Res({ passthrough: true }) res) {
  // const bearer_token = await this.authService.login(req.user);
  // this.setCookie(res, bearer_token);
  // return {
  //   user_token: bearer_token,
  //   user: req.user,
  // };
  // }

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
