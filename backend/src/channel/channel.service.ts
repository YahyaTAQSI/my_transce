import { Injectable } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ChannelDto, channelData, updateChannelDto } from './dto/channelDto';
import { ChatGateway } from 'src/chatSockets/chat.getway';

@Injectable()
export class ChannelService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createDM(createChannelDto: ChannelDto) {
    const { name, topic, ...rest } = createChannelDto;
    const data = { name, topic };
    const channel = await this.databaseService.channel.create({
      data: data,
    });
    if (channel) {
      const roles = await this.databaseService.role.createMany({
        data: [
          {
            channelID: channel.id,
            userID: rest.id,
          },
          {
            channelID: channel.id,
            userID: rest.friendId,
          },
        ],
      });
      if (roles) await this.findOne(channel.id);
    }
  }

  async findOne(id: number) {
    const res = await this.databaseService.channel.findUnique({
      where: { id: id },
      include: {
        roles: {
          include: { user: true },
        },
        messages: { orderBy: { createdAT: 'desc' }, take: 1 },
      },
    });

    const channelData = {
      id: res.id,
      roles: [],
      lastMSG: res.messages[0]?.content || '',
      sendAT: res.messages[0]?.createdAT || new Date(),
    };

    res.roles.forEach((role) => {
      const roleData = {
        ...role.user,
        blocked: role.blocked,
      };
      channelData.roles.push(roleData);
    });
    this.chatGateway.updateFriendList(channelData);
    this.chatGateway.updateAllUsers(channelData);
    return channelData;
  }

  async findMyFriends(id: number) {
    const res = await this.databaseService.channel.findMany({
      where: {
        AND: [
          { type: 'DM' },
          {
            roles: {
              some: { userID: id },
            },
          },
        ],
      },
      include: {
        roles: {
          include: { user: true },
        },
        messages: { orderBy: { createdAT: 'desc' }, take: 1 },
      },
    });

    const myFriends: channelData[] = [];
    res.forEach((channel) => {
      const channelData = {
        id: channel.id,
        roles: [],
        lastMSG: channel.messages[0]?.content || '',
        sendAT: channel.messages[0]?.createdAT || new Date(),
      };

      channel.roles.forEach((role) => {
        const roleData = {
          ...role.user,
          blocked: role.blocked,
        };
        channelData.roles.push(roleData);
      });
      myFriends.push(channelData);
    });

    return myFriends;
  }

  findAll() {
    return this.databaseService.channel.findMany({
      include: {
        roles: {
          select: {
            user: {
              select: {
                uid: true,
                status: true,
                username: true,
                email: true,
                bio: true,
                // avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async updateDM(body: updateChannelDto) {
    const role = await this.databaseService.role.findFirst({
      where: {
        channelID: body.channelID,
        userID: body.friendId,
      },
    });
    if (role) {
      const newRole = await this.databaseService.role.update({
        where: { id: role.id },
        data: { blocked: body.blocked },
      });
      console.log('newRole>>>', newRole);
      this.chatGateway.updateBlockedFriend(newRole);
      return newRole;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
