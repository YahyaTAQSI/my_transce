import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ChatModule } from 'src/chatSockets/chat.module';

@Module({
  imports:[ChatModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
