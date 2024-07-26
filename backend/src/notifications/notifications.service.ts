import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ChatGateway } from 'src/chatSockets/chat.getway';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(createNotificationDto: Prisma.NotificationUncheckedCreateInput) {
    const getNotificatons = await this.databaseService.notification.findFirst({
      where: {
        ruserId: createNotificationDto.ruserId,
        suserId: createNotificationDto.suserId,
      },
    });

    if (getNotificatons) return;
    const notification = await this.databaseService.notification.create({
      data: createNotificationDto,
      include: { suser: true },
    });
    this.chatGateway.sendNotification(notification);
    return notification;
  }

  async createChannelNotif(
    createNotificationDto: Prisma.NotificationUncheckedCreateInput,
  ) {
    console.log('createNotificationDto=>', createNotificationDto);
    const getNotificatons = await this.databaseService.notification.findFirst({
      where: {
        chnnelId: createNotificationDto.chnnelId,
        suserId: createNotificationDto.suserId,
        ruserId: createNotificationDto.ruserId,
      },
    });

    if (getNotificatons) {
      console.log('DEJA VU');
      return;
    }
    const notification = await this.databaseService.notification.create({
      data: createNotificationDto,
      include: { suser: true },
    });
    this.chatGateway.sendNotification(notification);
    return notification;
  }

  async findAll() {
    return this.databaseService.notification.findMany({});
  }

  async findOne(id: number) {
    return this.databaseService.notification.findMany({
      where: { ruserId: id, read: false },
      include: { suser: true },
    });
  }

  async update(
    id: number,
    updateNotificationDto: Prisma.NotificationUpdateInput,
  ) {
    return this.databaseService.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async remove(id: number) {
    const res = await this.databaseService.notification.delete({
      where: { id },
    });
    this.chatGateway.deleteNotification(res);
  }
}
