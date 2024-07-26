import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ItemsModule } from './items/items.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AchievementsModule } from './achievements/achievements.module';
import { FriendsModule } from './friends/friends.module';
import { AuthModule } from './auth/auth.module';
import { MatchHistoryModule } from './match-history/match-history.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { UserItemsModule } from './user-items/user-items.module';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { UploadModule } from './upload/upload.module';
import { CustomValidationPipe } from './auth/pipes/user.validation.pipe';
import { MulterModule } from '@nestjs/platform-express';
import { UserAchievementModule } from './user-achievement/user-achievement.module';
import { ChannelsController } from './channels/channels.controller';
import { ChannelsModule } from './channels/channels.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './public',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UsersModule,
    DatabaseModule,
    NotificationsModule,
    AchievementsModule,
    ItemsModule,
    FriendsModule,
    AuthModule,
    MatchHistoryModule,
    ChannelModule,
    MessageModule,
    UserItemsModule,
    UploadModule,
    UserAchievementModule,
    ChannelsModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule {}
