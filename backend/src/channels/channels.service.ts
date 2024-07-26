import { Injectable } from '@nestjs/common';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { DatabaseService } from 'src/database/database.service';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { ChatGateway } from '../chatSockets/chat.getway';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatGateway: ChatGateway,
  ) { }

  async create(
    file: Express.Multer.File,
    createChannelDto: Prisma.ChannelCreateInput,
    userId: string,
  ) {
    const filePath = path.join(process.cwd(), 'public', file.originalname);
    // createChannelDto.uri = filePath;
    // createChannelDto.uri = `http://localhost:3000/${filePath}`;
    await fs.promises.writeFile(filePath, file.buffer);
    console.log('!!!!!!', createChannelDto);

    const imageName = path.basename(filePath);
    createChannelDto.uri = `${process.env.BACK_URL}/${imageName}`;
    const createdChannel = await this.databaseService.channel.create({
      data: createChannelDto,
    });
    await this.databaseService.role.create({
      data: {
        channelID: createdChannel.id,
        userID: parseInt(userId),
        role: 'OWNER',
      },
    });
    this.chatGateway.updateChannels();
    return 'This action adds a new channel';
  }

  async findAll(text: string) {
    const channels = await this.databaseService.channel.findMany({
      where: {
        OR: [{ type: 'PUBLIC' }, { type: 'PROTECTED' }, { type: 'PRIVATE' }],
        name: { contains: text },
      },
      take: 10,
    });
    console.log('TEXT =>>', channels);
    return channels;
  }

  async findOne(userID: number) {
    const roles = await this.databaseService.role.findMany({
      where: {
        userID,
        channels: {
          type: { not: 'DM' },
        },
      },
      include: {
        channels: {
          include: { roles: true },
        },
      },
    });
    return roles;
  }

  async getRoles(channelId: number) {
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });
    console.log('ROLES:', roles);
    return roles;
  }

  async findMessages(channelId: number) {
    const users = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });
    return users;
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    console.log(updateChannelDto);
    return { data: `This action updates a #${id} channel` };
  }
  // return { data: `channel id : ${channelId} uid : ${userId}` };

  async makeAdmin(channelId: number, userId: number) {
    const result = await this.databaseService.role.updateMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
      data: { role: 'ADMIN', updatedAt: new Date() },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });

    this.chatGateway.updateRoles(roles);
    return result;
  }
  async rmAdmin(channelId: number, userId: number) {
    const result = await this.databaseService.role.updateMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
      data: { role: 'USER', updatedAt: new Date() },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });

    this.chatGateway.updateRoles(roles);
    return result;
  }
  async joinPublic(channelID: number, userID: number) {
    const result = await this.databaseService.role.create({
      data: {
        channelID: channelID,
        userID: userID,
        role: 'USER',
        mutedSince: new Date(),
        condition: 'NORMAL',
        updatedAt: new Date(),
      },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelID },
      include: { user: true },
    });

    this.chatGateway.updateRoles(roles);
    return result;
  }
  async kick(channelId: number, userId: number) {
    const result = await this.databaseService.role.deleteMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });
    console.log('role now:', roles);
    if (roles.length == 0) {
      await this.databaseService.message.deleteMany({
        where: { channelID: channelId },
      });
      await this.databaseService.channel.delete({
        where: { id: channelId },
      });
    }
    this.chatGateway.updateUsersAfterSomeoneKick(roles);
    return result;
  }
  async leave(channelId: number, userId: number) {
    // // bring all the users of the specified channel
    // // if the user is the owner
    const oldestRole = await this.databaseService.role.findMany({
      where: { channelID: channelId, role: { in: ['ADMIN', 'USER'] } },
      include: { user: true },
      orderBy: [
        { role: 'desc' }, // Sort by role field in descending order (admins first, then users)
        { updatedAt: 'asc' }, // Sort by updatedAt field in ascending order
      ],
      take: 1,
    });
    if (oldestRole) {
      await this.databaseService.role.deleteMany({
        where: {
          channelID: channelId,
          userID: userId,
        },
      });
      await this.databaseService.role.updateMany({
        where: {
          channelID: oldestRole[0].channelID,
          userID: oldestRole[0].userID,
        },
        data: { role: 'OWNER' },
      });
    }
    console.log('oldestRole =', oldestRole);
    // const result = await this.databaseService.role.deleteMany({
    //   where: {
    //     channelID: channelId,
    //     userID: userId,
    //   },
    // });
    // const roles = await this.databaseService.role.findMany({
    //   where: { channelID: channelId },
    //   include: { user: true },
    // });

    // this.chatGateway.updateUsersAfterSomeoneKick(roles);
    // return result;
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });
    this.chatGateway.updateRoles(roles);
  }

  async mute(channelId: number, userId: number) {
    const result = await this.databaseService.role.updateMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
      data: { condition: 'MUTED', mutedSince: new Date() },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });

    this.chatGateway.updateRoles(roles);
    return result;
  }

  async rmMute(channelId: number, userId: number) {
    const result = await this.databaseService.role.updateMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
      data: { condition: 'NORMAL' },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });

    this.chatGateway.updateRoles(roles);
    return result;
  }

  async block(channelId: number, userId: number) {
    const result = await this.databaseService.role.updateMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
      data: { condition: 'BLOCKED', mutedSince: new Date() },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });

    this.chatGateway.updateRoles(roles);
    return result;
  }
  async rmblock(channelId: number, userId: number) {
    const result = await this.databaseService.role.updateMany({
      where: {
        channelID: channelId,
        userID: userId,
      },
      data: { condition: 'NORMAL', mutedSince: new Date() },
    });
    const roles = await this.databaseService.role.findMany({
      where: { channelID: channelId },
      include: { user: true },
    });
    this.chatGateway.updateRoles(roles);
    // this.chatGateway.updateMessagesAfterBlock();
    return result;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
