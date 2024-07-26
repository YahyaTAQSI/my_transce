import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchHistoryModule } from 'src/match-history/match-history.module';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { UserAchievementService } from 'src/user-achievement/user-achievement.service';
import { UsersModule } from 'src/users/users.module';
import { UserItemsService } from 'src/user-items/user-items.service';

@Module({
  controllers: [GameController],
  providers: [
    GameService,
    GameGateway,
    MatchHistoryService,
    UserAchievementService,
    UserItemsService
  ],
  imports: [UsersModule, MatchHistoryModule],
  exports: [GameGateway],
})
export class GameModule {}
