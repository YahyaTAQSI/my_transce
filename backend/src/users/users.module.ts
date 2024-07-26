import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChatModule } from 'src/chatSockets/chat.module';
import { MatchHistoryModule } from 'src/match-history/match-history.module';
import { DatabaseService } from 'src/database/database.service';

import { UserAchievementModule } from 'src/user-achievement/user-achievement.module';
import { ChatGateway } from 'src/chatSockets/chat.getway';


@Module({
  imports: [
    ChatModule,
    forwardRef(() => MatchHistoryModule),
    UserAchievementModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService, ChatGateway],
  exports: [UsersService],
})
export class UsersModule {}

