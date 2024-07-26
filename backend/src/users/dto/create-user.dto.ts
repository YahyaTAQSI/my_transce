import { UserStatus } from '@prisma/client';
import { IsEmail, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  status?: UserStatus;

  @MinLength(5)
  username: string;

  @IsEmail()
  email: string;

  bio?: string;

  @MinLength(8)
  @Matches(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/)
  password: string;

  @MinLength(8)
  @Matches(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/)
  newPassword?: string = 'Test1234';

  @MinLength(8)
  @Matches(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/)
  oldPassword?: string = 'Test1234';

  @MinLength(8)
  @Matches(/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/)
  confirmedPassword?: string = 'Test1234';

  twoFA?: boolean;

  avatar: string;
  banner: string;
  paddle: string;
  level?: number;
  points?: number;

  xp?: number;
  win?: number;
  lose?: number;
  strategy?: string;
  role?: string;
  wallet?: number;
  twoFASecret?: string;
}
