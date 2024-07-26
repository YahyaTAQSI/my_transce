import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { ChatModule } from 'src/chatSockets/chat.module';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
  imports: [ChatModule],
})
export class ChannelModule {}
