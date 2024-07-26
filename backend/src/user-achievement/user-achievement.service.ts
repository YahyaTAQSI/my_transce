import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserAchievementService {
  constructor(private readonly databaseService: DatabaseService) {}

  

  create(createUserAchievementDto: Prisma.UserAchievementUncheckedCreateInput) {
    return this.databaseService.userAchievement.create({
      data: createUserAchievementDto,
    });
  }

  async findOne(id: number) {
    // const res = await this.databaseService.userAchievement.findMany({
    //   relationLoadStrategy: 'join',
    //   where: { userId: id },
    //   include: { achievement: true, },
    // });

    ///////////////           change it  <-----------------------------------
    const res = await this.databaseService.$queryRaw`
      SELECT
        a.name,
        a.description,
        a.uri,
        ua."createdAT",
        COALESCE(ua.unlocked, false) as unlocked
      FROM
        "Achievement" a
      LEFT JOIN
      "UserAchievement" ua
      ON
        a.name = ua."achivementName" AND ua."userId" = ${id}
    `;
    return res;
  }

  findAll() {
    return;
  }
  update(
    id: number,
    updateUserAchievementDto: Prisma.UserAchievementUpdateInput,
  ) {
    return `This action updates a #${id} userAchievement`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAchievement`;
  }
}
