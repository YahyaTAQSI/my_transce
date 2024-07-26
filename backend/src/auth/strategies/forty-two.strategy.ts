import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { AuthService } from '../auth.service';

// change the redirect link

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'FortyTwo') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.CLIENT_ID_FORTY_TWO,
      clientSecret: process.env.CLIENT_SECRET_FORTY_TWO,
      callbackURL: process.env.REDIRECT_LINK_FORTY_TWO,
      Scope: ['profile'],
    });
  }
  // refresh token ??
  // store in req the user
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback
  ) {
    const { login, email, image } = profile._json;

    // const user = await this.authService.signUpWithProvider({
    //   username: login,
    //   email: email,
    //   password: this.authService.generateRandomChars(10),
    //   strategy: '42',
    // });
    const user = {
      username: login,
      email: email,
      password: this.authService.generateRandomChars(10),
      strategy: '42',
      avatar: image.link,
      paddle: `${process.env.BACK_URL}/defaultPaddle.png`,
      banner: `${process.env.BACK_URL}/defaultBanner.jpg`,
    };
    // console.log("user ", user);
    done(null, user);
    return user;
  }
}
