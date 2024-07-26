import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AchievementsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAchievementDto: Prisma.AchievementCreateInput) {
    return this.databaseService.achievement.create({
      data: createAchievementDto,
    });
  }

  createMany(createManyDto:Prisma.AchievementUncheckedCreateInput){
    return this.databaseService.achievement.createMany({
      data:createManyDto
    })
  }

  async findAll() {
    return this.databaseService.achievement.findMany({});
  }

  async findOne(id: number) {
    return this.databaseService.achievement.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        uri: true,
        userAchievements: {
          where: {
            AND: {
              userId: id,
              unlocked: true,
            },
          },
        },
      },
    });
  }

  async update(
    id: number,
    updateAchievementDto: Prisma.AchievementUpdateInput,
  ) {
    return this.databaseService.achievement.update({
      where: { id },
      data: updateAchievementDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.achievement.delete({
      where: { id },
    });
  }
}
