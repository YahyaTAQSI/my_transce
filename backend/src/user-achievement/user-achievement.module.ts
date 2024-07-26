import { Module } from '@nestjs/common';
import { UserAchievementService } from './user-achievement.service';
import { UserAchievementController } from './user-achievement.controller';

@Module({
  controllers: [UserAchievementController],
  providers: [UserAchievementService],
})
export class UserAchievementModule {}
