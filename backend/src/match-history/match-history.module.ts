import { Module, forwardRef } from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { MatchHistoryController } from './match-history.controller';
import { UserAchievementService } from 'src/user-achievement/user-achievement.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [MatchHistoryController],
  providers: [MatchHistoryService, UserAchievementService],
  exports: [MatchHistoryService],
})
export class MatchHistoryModule {}
