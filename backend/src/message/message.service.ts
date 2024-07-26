import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { messageDto } from './dto/messageDto';
import { ChatGateway } from 'src/chatSockets/chat.getway';

@Injectable()
export class MessageService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(createMessageDto: messageDto) {
    const message = await this.databaseService.message.create({
      data: createMessageDto,
      include: { users: { select: { avatar: true } } },
    });

    this.chatGateway.sendMessage(message);
  }

  findAll() {
    return this.databaseService.message.findMany({});
  }

  async findOne(id: number) {
    const messages = await this.databaseService.message.findMany({
      where: { channelID: id },
      include: { users: { select: { avatar: true } } },
    });
    // const groupedMessages = {};
    // messages.forEach((message) => {
    //   const date = new Date(message.createdAT).toLocaleDateString();
    //   if (!groupedMessages[date]) {
    //     groupedMessages[date] = [];
    //   }
    //   groupedMessages[date].push(message);
    // });

    return messages;
  }

  update(id: number, updateMessageDto: Prisma.MessageUpdateInput) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
