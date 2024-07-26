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
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { FortyTwoGuard } from './guards/forty-two-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CustomValidationPipe } from './pipes/user.validation.pipe';
import { GoogleGuard } from './guards/google-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) { }

  setCookie(@Res() res, bearer_token?: string) {
    if (!bearer_token) bearer_token = '';
    res.cookie(
      res.cookie('user_token', bearer_token, {
        expires: new Date(Date.now() + 3600000),
      }),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@Body() user, @Req() req, @Res({ passthrough: true }) res) {
    const bearer_token = await this.authService.login(req.user);
    if (req.user.twoFA) {
      return { user: req.user };
    }
    this.setCookie(res, bearer_token);
    return {
      user_token: bearer_token,
      user: req.user,
    };
  }

  @Public()
  @Post('signup')
  @UsePipes(new CustomValidationPipe())
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res,
  ) {
    const user = await this.authService.signUp(createUserDto);
    const bearer_token = await this.authService.login(user);
    this.setCookie(res, bearer_token);
    return {
      user_token: bearer_token,
      user: user,
    };
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res) {
    this.setCookie(res);
    return {};
  }

  @UseGuards(FortyTwoGuard)
  @Get('login-42')
  @Public()
  async fortyTwoAuth() {
    return {};
  }

  /*******************************************log in  with 42*************************************************** */
  @UseGuards(FortyTwoGuard)
  @Get('fortyTwo/redirect')
  @Public()
  @Redirect(`${process.env.FRONT_URL}/login`, 302)
  async fortyTwoAuthRedirect(@Req() req, @Res({ passthrough: true }) res) {
    if (!req.user) {
      return {};
    }
    const createUserDto: CreateUserDto = {
      username: req.user.username,
      email: req.user.email,
      password: this.authService.generateRandomChars(10),
      avatar: req.user.avatar,
      paddle: req.user.paddle,
      banner: req.user.banner,
      strategy: '42',
    };

    const cookies = await this.authService.signUpWithProvider(createUserDto);
    const userData = {
      loggedUser: cookies.twoFA ? -1 : cookies.uid,
      userTwoFA: cookies.uid,
      userToken: cookies.bearer_token,
      twoFA: cookies.twoFA,
    };
    res.cookie('userData', JSON.stringify(userData));

    // res.cookie('loggedUser', cookies.uid, { httpOnly: true });
    // res.cookie('userToken', cookies.bearer_token, { httpOnly: true });
    return {
      user_token: cookies.bearer_token,
      user: cookies.uid,
    };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  @Public()
  async googleAuth() {
    return {};
  }

  @Public()
  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  @Redirect(`http://${process.env.FRONT}/login`, 302)
  async googleAuthRedirect(@Req() req, @Res({ passthrough: true }) res) {
    if (!req.user) {
      return {};
    }
    const createUserDto = {
      username: req.user.username,
      email: req.user.email,
      password: req.user.password,
      avatar: req.user.avatar,
      paddle: req.user.paddle,
      banner: req.user.banner,
      strategy: 'google',
    };
    const cookies = await this.authService.signUpWithProvider(createUserDto);

    const userData = {
      loggedUser: cookies.twoFA ? -1 : cookies.uid,
      userTwoFA: cookies.uid,
      userToken: cookies.bearer_token,
      twoFA: cookies.twoFA,
    };

    res.cookie('userData', JSON.stringify(userData));
    // res.cookie('userToken', cookies.bearer_token, { httpOnly: true });
    return {
      user_token: cookies.bearer_token,
      user: cookies.uid,
    };
  }

  @Get('tokens')
  async isTokenExpired(@Req() req) {
    console.log(req.user);
    if (req.user) return { expired: true };
    return { expired: true };
  }

  // I need uid, email
  @Post('2fa/turn-on')
  // @UseGuards(Jwt2faAuthGuard)
  async register(@Res({ passthrough: true }) res, @Body() body) {
    console.log('BODY ', body);
    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(body);
    const qrCode = await this.authService.generateQrCodeDataURL(otpAuthUrl);
    return qrCode;
  }

  /*******************************************check for twofa *************************************************** */
  @Post('2fa')
  @Public()
  @HttpCode(200)
  async authenticate(@Res({ passthrough: true }) res, @Body() data) {
    const user = await this.userService.findOne(data.uid);
    const body = { ...user, twoFaCode: data.twoFaCode };
    const isCodeValid = this.authService.isTwoFactorCodeValid(body);

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const bearer_token = await this.authService.login(body);
    // this.setCookie(res, bearer_token);

    /*-------------------------------------*/

    // const reqUserData = req.cookies.userData;
    // const fakeData =
    //   '{"userTwoFA":-1,"loggedUser":-1,"userToken":"","twoFA":false}';
    // const theData = reqUserData === undefined ? fakeData : reqUserData;
    // const data = await JSON.parse(theData);
    // const userData = {
    //   loggedUser: cookies.twoFA ? -1 : cookies.uid,
    //   userToken: data.userToken === undefined ? '' : data.userToken,
    //   twoFA: cookies.twoFA,
    // };
    // res.cookie('userData', JSON.stringify(userData));

    /*-------------------------------------*/

    return {
      userToken: bearer_token,
      user: body,
    };
    // return { userToken: bearer_token, user: body };
  }
}
