import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { ChatModule } from 'src/chatSockets/chat.module';
import { ChannelService } from 'src/channel/channel.service';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [ChatModule, ChannelModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
