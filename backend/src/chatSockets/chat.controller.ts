import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly ChatService: ChatService) {}

  @Get()
  getChat() {
    return this.ChatService.getChat();
  }
}
