import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { FriendDto } from './dto/friendDto';
import { UsersService } from 'src/users/users.service';
import { ChatGateway } from 'src/chatSockets/chat.getway';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()
export class FriendsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatGateway: ChatGateway,
    private readonly channelService: ChannelService,
  ) {}

  async create(createFriendDto: FriendDto) {
    const { user1Id, user2Id } = createFriendDto;
    const existingFriendship = await this.databaseService.userFriend.findFirst({
      where: {
        OR: [
          {
            user1Id: user1Id,
            user2Id: user2Id,
          },
          {
            user1Id: user2Id,
            user2Id: user1Id,
          },
        ],
      },
    });
    if (!existingFriendship) {
      const friend = await this.databaseService.userFriend.create({
        data: createFriendDto,
        include: {
          usersSendThem: true,
          usersSendMe: true,
        },
      });
      const channelDto = {
        name: '',
        topic: '',
        id: user1Id,
        friendId: user2Id,
      };
      this.channelService.createDM(channelDto);
      // this.chatGateway.updateFriendList(friend);
    }
  }

  async findAll() {
    return this.databaseService.userFriend.findMany({});
  }
  async getChoosedAvatarOfUser(uid: number) {
    const choosedItems = await this.databaseService.userItem.findMany({
      select: {
        item: true,
      },
      where: {
        AND: [{ userId: uid }, { choosed: true }],
      },
    });
    // console.log("choosedItems", choosedItems);

    const avatar = choosedItems.filter((item: any) => {
      if (item.item.type == 'avatar') {
        return item.item.name;
      }
    });
    const avatarValue = avatar.length > 0 ? avatar[0].item.name : 'default.png';
    return avatarValue;
  }

  async findOne(id: number) {
    const friends = await this.databaseService.userFriend.findMany({
      where: {
        OR: [{ user1Id: id }, { user2Id: id }],
        status: 'ACCEPTED',
      },
      include: {
        usersSendThem: {
          include: {
            userItems: true,
          },
        },
        usersSendMe: {
          include: {
            userItems: true,
          },
        },
      },
    });
    // ??

    const allFriends = await friends
      .map((friend) => {
        const friendData =
          friend.user1Id === id ? friend.usersSendMe : friend.usersSendThem;

        return {
          uid: friendData.uid,
          username: friendData.username,
          email: friendData.email,
          status: friendData.status,
          avatar: friendData.avatar,
          fsStatus: friend.status,
        };
      })
      .sort((a, b) => {
        const statusOrder = { online: 1, ingame: 2, offline: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

    return allFriends;
  }

  async findIfFriedn(user1Id: number, user2Id: number) {
    const friend = await this.databaseService.userFriend.findFirst({
      where: {
        OR: [
          {
            user1Id: user1Id,
            user2Id: user2Id,
          },
          {
            user1Id: user2Id,
            user2Id: user1Id,
          },
        ],
      },
    });
    if (friend) return true;
    return false;
  }

  async findAllExceptFriends(userId: number) {
    const friends = await this.databaseService.userFriend.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        NOT: { OR: [{ status: 'PENDING' }, { status: 'NONE' }] },
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    const friendIds = friends.flatMap((friend) => [
      friend.user1Id,
      friend.user2Id,
    ]);
    friendIds.push(userId);

    const users = await this.databaseService.t_User.findMany({
      where: {
        NOT: {
          uid: {
            in: friendIds,
          },
        },
      },
      include: { userItems: { where: { choosed: true } } },
    });

    const alteredUers = await users.map((u) => {
      if (u.userItems.length === 0) {
        return { ...u, avatar: 'default.png' };
      } else return u;
    });
    return users;
  }

  async update(
    id: number,
    friendId: number,
    updateUserDto: Prisma.UserFriendUpdateInput,
  ) {
    return this.databaseService.userFriend.updateMany({
      where: {
        OR: [
          { user1Id: id, user2Id: friendId },
          { user1Id: friendId, user2Id: id },
        ],
      },
      data: { status: updateUserDto.status },
    });
  }

  async remove(id: number) {
    return this.databaseService.userFriend.deleteMany({
      where: {
        OR: [{ user1Id: id }, { user2Id: id }],
      },
    });
  }
}
