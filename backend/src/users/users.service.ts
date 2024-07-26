import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-User.dto';
import { UserStatus } from '@prisma/client';
import { ChatGateway } from 'src/chatSockets/chat.getway';
import { MatchHistoryService } from 'src/match-history/match-history.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => MatchHistoryService))
    private readonly matchHistory: MatchHistoryService,
  ) {}

  async delete() {
    return this.databaseService.t_User.deleteMany({});
  }

  async validateUserId(uid: number) {
    const user = await this.findOne(uid);
    return user;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.findUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid Username');
    }
    const isMatch = await bcrypt.compare(pass, user?.password);
    if (isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid password');
  }

  async create(createUserDto: CreateUserDto) {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    try {
      if (createUserDto.strategy === 'local')
        createUserDto.avatar = `${process.env.BACK_URL}/default.png`;
      createUserDto.paddle = `${process.env.BACK_URL}/defaultPaddle.png`;
      createUserDto.banner = `${process.env.BACK_URL}/defaultBanner.jpg`;

      const user = await this.databaseService.t_User.create({
        data: createUserDto,
      });
      this.chatGateway.updateAllUsers(user);
      return user;
    } catch (err: any) {
      throw new UnauthorizedException(
        `${err.meta?.target} cannot be duplicated`,
      );
    }
  }

  async findAll() {
    const users = await this.databaseService.t_User.findMany({});
    return users;
  }

  async orderByAsc() {
    const users = await this.databaseService.t_User.findMany({
      orderBy: { xp: 'desc' },
    });
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        const win = await this.matchHistory.findwinnedMatches(user.uid);
        const lose = await this.matchHistory.findLostMatches(user.uid);
        return {
          ...user,
          win: win.length,
          lose: lose.length,
        };
      }),
    );
    // updatedUsers.sort((a, b) =>
    //   b.win - a.win ? b.win - a.win : a.lose - b.lose,
    // );
    return updatedUsers;
  }
  async findOneName(username: string) {
    const user = await this.databaseService.t_User.findFirst({
      where: { username },
    });
    if (!user) {
      throw new HttpException('no Username', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async findOne(uid: number) {
    const user = await this.databaseService.t_User.findFirst({
      where: { uid },
    });
    if (user) {
      if (user.avatar == '') user.avatar = 'default.png';
      const finalUser = {
        ...user,
        oldPassword: '',
        newPassword: '',
        confirmedPassword: '',
      };

      return finalUser;
    }

    return user;
  }

  async findAllUserExceptMe(uid: number) {
    const allUsers = await this.databaseService.t_User.findMany({
      where: { NOT: { uid: uid } },
    });
    return allUsers;
  }

  async findUserByUsername(username: string) {
    const user = await this.databaseService.t_User.findFirst({
      where: { username },
    });
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.databaseService.t_User.findFirst({
      where: { email },
    });
    return user;
  }

  async update(uid: number, updateUserDto: UpdateUserDto) {
    if (
      updateUserDto.newPassword &&
      updateUserDto.confirmedPassword &&
      updateUserDto.oldPassword
    ) {
      const userInDb = await this.findOne(uid);

      const user = await this.validateUser(
        userInDb.username,
        updateUserDto.oldPassword,
      );
      if (!user) {
        throw new BadRequestException('Incorrect old password');
      }
      updateUserDto.password = await bcrypt.hash(updateUserDto.newPassword, 10);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { newPassword, oldPassword, confirmedPassword, ...result } =
        updateUserDto;
      try {
        const res = await this.databaseService.t_User.update({
          where: { uid },
          data: result,
        });
        return res;
      } catch (err: any) {
        throw new BadRequestException(
          `${err.meta?.target} Already taken by another user`,
        );
      }
      // return this.databaseService.t_User.update({
      //   where: { uid },
      //   data: result,
      // });
    }
    try {
      const res = await this.databaseService.t_User.update({
        where: { uid },
        data: updateUserDto,
      });
      return res;
    } catch (err: any) {
      throw new BadRequestException(
        `${err.meta?.target} Already taken by another user`,
      );
    }
  }

  async updateStatus(uid: number, status: UserStatus) {
    console.log('>>>>>>', status);

    const res = await this.databaseService.t_User.update({
      where: { uid },
      data: { status },
    });

    this.chatGateway.updateFriendStatus(res);
    this.chatGateway.updateOnlineFriendList();
  }

  getRank = (xp: number) => {
    if (xp >= 0 && xp <= 100) return 'Beginner';
    if (xp > 100 && xp <= 200) return 'Intermediate';
    if (xp > 200 && xp <= 300) return 'Expert';
    if (xp > 300 && xp <= 400) return 'Master';
    if (xp > 400 && xp <= 500) return 'Grandmaster';
    if (xp > 500) return 'Apex';
  };

  adjustXP = (xp: number, result: string) => {
    const rank = this.getRank(xp);
    let points = 0;

    switch (rank) {
      case 'Beginner':
        points = result === 'win' ? 10 : -1;
        break;
      case 'Intermediate':
        points = result === 'win' ? 8 : -2;
        break;
      case 'Expert':
        points = result === 'win' ? 6 : -3;
        break;
      case 'Master':
        points = result === 'win' ? 4 : -4;
        break;
      case 'Grandmaster':
        points = result === 'win' ? 2 : -5;
        break;
      case 'Apex':
        points = result === 'win' ? 1 : -6;
        break;
    }
    const res = xp + points;
    return res < 0 ? 0 : res;
  };

  async updateXP(uid: number, status: string) {
    const user = await this.databaseService.t_User.findUnique({
      where: { uid },
    });
    if (user) {
      const oldXp = user.xp;
      console.log('old xp', oldXp);
      const newXp = this.adjustXP(oldXp, status);
      const newRank = this.getRank(newXp);
      const res = await this.databaseService.t_User.update({
        where: { uid },
        data: { xp: newXp, rank: newRank },
      });
      console.log('new xp', res.xp);
    }
  }

  async updateWallet(uid: number) {
    const user = await this.databaseService.t_User.findUnique({
      where: { uid },
    });
    if (user) {
      const oldWallet = user.wallet;
      const newWallet = oldWallet + 25;
      const res = await this.databaseService.t_User.update({
        where: { uid },
        data: { wallet: newWallet },
      });
    }
  }

  async setTwoFaSecret(twoFASecret: string, uid: number) {
    this.update(uid, { twoFASecret });
  }

  async remove(uid: number) {
    return this.databaseService.t_User.delete({ where: { uid } });
  }

  async turnOnTwoFA(uid: number) {
    this.update(uid, { twoFA: true });
  }
}
