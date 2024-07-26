import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { GameMode, Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { UserAchievementService } from 'src/user-achievement/user-achievement.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MatchHistoryService {
  constructor(
    private databaseService: DatabaseService,
    private userAchievementService: UserAchievementService,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) { }

  async create(createMatchHistoryDto: Prisma.MatchHistoryCreateInput) {
    const matchHistory = await this.databaseService.matchHistory.create({
      data: createMatchHistoryDto,
    });

    if (matchHistory.gameMode === GameMode.RANDOM) {
      this.userService.updateWallet(matchHistory.winner);
    }

    this.userService.updateXP(matchHistory.winner, 'win');
    this.userService.updateXP(matchHistory.loser, 'lose');

    // change status to ingame
    this.userService.updateStatus(matchHistory.winner, 'online');
    this.userService.updateStatus(matchHistory.loser, 'online');
    // change status to ingame

    try {

      const winnerWinnedMatches = (await this.findwinnedMatches(
        matchHistory.winner,
      )) as Array<{}>;
      const loserLostMatches = (await this.findLostMatches(
        matchHistory.loser,
      )) as Array<{}>;

      const winnerAchievements = (await this.userAchievementService.findOne(
        matchHistory.winner,
      )) as Array<{ name; unlocked }>;
      const loserAchievements = (await this.userAchievementService.findOne(
        matchHistory.loser,
      )) as Array<{ name; unlocked }>;

      if (winnerWinnedMatches && winnerWinnedMatches.length === 1) {
        if (
          winnerAchievements.find((a) => a.name === 'First Win').unlocked ===
          false
        ) {
          await this.userAchievementService.create({
            userId: matchHistory.winner,
            achivementName: 'First Win',
            unlocked: true,
          });
        }
      }
      if (loserLostMatches && loserLostMatches.length === 1) {
        if (
          loserAchievements.find((a) => a.name === 'First Defeat').unlocked ===
          false
        ) {
          await this.userAchievementService.create({
            userId: matchHistory.loser,
            achivementName: 'First Defeat',
            unlocked: true,
          });
        }
      }

      if (matchHistory.loserScore === 0) {
        if (
          winnerAchievements.find((a) => a.name === 'Flawless Victory')
            .unlocked === false
        ) {
          await this.userAchievementService.create({
            userId: matchHistory.winner,
            achivementName: 'Flawless Victory',
            unlocked: true,
          });
        }
      }

      if (winnerWinnedMatches && winnerWinnedMatches.length === 50) {
        if (
          winnerAchievements.find((a) => a.name === 'Ping Pong Pro').unlocked ===
          false
        ) {
          await this.userAchievementService.create({
            userId: matchHistory.winner,
            achivementName: 'Ping Pong Pro',
            unlocked: true,
          });
        }
      }

      const matchDurationInMinutes =
        (matchHistory.endAt.getTime() - matchHistory.startAt.getTime()) /
        1000 /
        60;
      if (matchDurationInMinutes >= 5) {
        if (
          winnerAchievements.find((a) => a.name === 'Marathon Match').unlocked ===
          false
        ) {
          await this.userAchievementService.create({
            userId: matchHistory.winner,
            achivementName: 'Marathon Match',
            unlocked: true,
          });
        }
        if (!loserAchievements.find((a) => a.name === 'Marathon Match')) {
          await this.userAchievementService.create({
            userId: matchHistory.loser,
            achivementName: 'Marathon Match',
            unlocked: true,
          });
        }
      }
    } catch (err: any) {
      console.log(err);
    }

    return matchHistory;
  }

  async findAll() {
    const matches = await this.databaseService.matchHistory.findMany({
      select: {
        winnerUser: {
          select: {
            username: true,
          },
        },
        loserUser: {
          select: {
            username: true,
          },
        },
        winnerScore: true,
        loserScore: true,
        createdAt: true,
        endAt: true,
        startAt: true,
        gameMode: true,
      },
    });
    const matches_two = matches.map((match) => {
      console.log(match);
      return {
        loserName: match.loserUser.username,
        winnerName: match.winnerUser.username,
        winnerScore: match.winnerScore,
        loserScore: match.loserScore,
        createdAt: match.createdAt,
        endAt: match.endAt,
        startAt: match.startAt,
        gameMode: match.gameMode,
        result: 'WIN',
      };
    });
    return matches_two;
  }

  async findMatchOfUser(userId: number) {
    const matchesOfUser = await this.databaseService.matchHistory.findMany({
      select: {
        winnerUser: {
          select: {
            username: true,
            uid: true,
          },
        },
        loserUser: {
          select: {
            username: true,
            uid: true,
          },
        },
        winnerScore: true,
        loserScore: true,
        createdAt: true,
        endAt: true,
        startAt: true,
        gameMode: true,
      },
      where: {
        OR: [
          {
            winnerUser: {
              uid: userId,
            },
          },
          {
            loserUser: {
              uid: userId,
            },
          },
        ],
      },
    });
    const matches_two = matchesOfUser.map((match) => {
      let me: string;
      let opponent: string;
      let myScore: number;
      let opponentScore: number;
      let result: string;
      if (match.loserUser.uid == userId) {
        me = match.loserUser.username;
        opponent = match.winnerUser.username;
        result = 'LOSE';
        myScore = match.loserScore;
        opponentScore = match.winnerScore;
      } else {
        me = match.winnerUser.username;
        opponent = match.loserUser.username;
        result = 'WIN';
        myScore = match.winnerScore;
        opponentScore = match.loserScore;
      }
      return {
        me: me,
        opponent: opponent,
        myScore: myScore,
        opponentScore: opponentScore,
        createdAt: match.createdAt,
        endAt: match.endAt,
        startAt: match.startAt,
        gameMode: match.gameMode,
        result: result,
      };
    });
    return matches_two;
  }

  async findwinnedMatches(userId: number) {
    const winnnedMatches = await this.databaseService.matchHistory.findMany({
      where: {
        winner: userId,
      },
    });
    return winnnedMatches;
  }

  async findLostMatches(userId: number) {
    const lostMatches = await this.databaseService.matchHistory.findMany({
      where: {
        loser: userId,
      },
    });
    return lostMatches;
  }

  async findOne(id: number) {
    console.log('match>>>>>>>>>', id);

    const match = await this.databaseService.matchHistory.findMany({
      where: {
        OR: [
          {
            winner: id,
          },
          {
            loser: id,
          },
        ],
      },
    });
    if (!match || !match.length) return [];
    const groupedData = match.reduce((acc, item) => {
      const date = item.createdAt.toISOString().slice(0, 13);
      if (!acc[date]) {
        acc[date] = { date, win: 0, lose: 0, w_l: 0 };
      }
      if (id === item.winner) {
        acc[date].win++;
      } else if (id === item.loser) {
        acc[date].lose++;
      }
      acc[date].w_l = (
        (acc[date].win / (acc[date].win + acc[date].lose)) *
        100
      ).toFixed(2);
      return acc;
    }, {});

    return Object.values(groupedData);
  }

  async update(
    id: number,
    updateMatchHistoryDto: Prisma.MatchHistoryUpdateInput,
  ) {
    const updated = await this.databaseService.matchHistory.update({
      where: { id },
      data: updateMatchHistoryDto,
    });
    return updated;
  }

  async remove(id: number) {
    await this.databaseService.matchHistory.delete({ where: { id } });
    return `Deleted`;
  }
}
