import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserItemsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPaddleColor(userId: number) {
    const userItems = await this.databaseService.userItem.findMany({
      where: {
        userId: userId,
      },
    });

    if (userItems.length > 0) {
      const choosedItems = userItems.filter((item) => item.choosed);

      if (choosedItems.length > 0) {
        const items = await this.databaseService.item.findMany({
          where: {
            type: 'paddle',
            AND: choosedItems.map((item) => {
              return { id: item.itemId };
            }),
          },
        });

        return items?.[0]?.color ?? "white";
      }
    }
    return 'white';
  }

  async updateWallet(uid: number, itemId: number) {
    const item = await this.databaseService.item.findUnique({
      where: { id: itemId },
    });

    const amount = item.price;

    const user = await this.databaseService.t_User.findUnique({
      where: { uid },
    });
    if (user) {
      const oldWallet = user.wallet;
      const newWallet = oldWallet - amount;
      const res = await this.databaseService.t_User.update({
        where: { uid },
        data: { wallet: newWallet },
      });
    }
  }

  async create(createUserItemDto: Prisma.UserItemUncheckedCreateInput) {
    const user = await this.databaseService.t_User.findFirst({
      where: { uid: createUserItemDto.userId },
    });

    this.updateWallet(user.uid, createUserItemDto.itemId);

    return await this.databaseService.userItem.create({
      data: createUserItemDto,
    });
  }

  async findAll() {
    return this.databaseService.userItem.findMany({});
  }

  async findUserItems(userId: number) {
    const userItems = await this.databaseService.userItem.findMany({
      where: {
        userId: userId,
      },
      select: {
        itemId: true,
        choosed: true,
      },
    });
    const userItemsId = userItems.map((item) => item.itemId);
    const allItems = await this.databaseService.item.findMany();
    const allItemsModified = allItems.map((item) => {
      const newItem = { ...item, choosed: false, owned: false };
      const index = userItemsId.indexOf(item.id);
      if (index != -1) {
        newItem.owned = true;
        newItem.choosed = userItems[index].choosed; // not always false
      }
      return newItem;
    });
    return allItemsModified;
  }

  async findOne(id: number) {
    return this.databaseService.userItem.findMany({ where: { userId: id } });
  }

  async updateOldItem(updateUserItemDto: any) {
    const ids: Prisma.UserItemUserIdItemIdCompoundUniqueInput = {
      userId: updateUserItemDto.userId,
      itemId: updateUserItemDto.oldId,
    };
    return this.databaseService.userItem.update({
      where: { userId_itemId: ids },
      data: { choosed: false },
    });
  }

  async update(updateUserItemDto: any) {
    await this.databaseService.userItem.updateMany({
      where: {
        AND: [
          { userId: updateUserItemDto.userId },
          { item: { type: updateUserItemDto.type } },
        ],
      },
      data: { choosed: false },
    });

    await this.databaseService.userItem.update({
      where: {
        userId_itemId: {
          itemId: updateUserItemDto.itemId,
          userId: updateUserItemDto.userId,
        },
      },
      data: { choosed: true },
    });
    if (updateUserItemDto.type == 'avatar')
      return await this.databaseService.t_User.update({
        where: { uid: updateUserItemDto.userId },
        data: { avatar: updateUserItemDto.img },
      });
    else if (updateUserItemDto.type == 'paddle')
      return await this.databaseService.t_User.update({
        where: { uid: updateUserItemDto.userId },
        data: { paddle: updateUserItemDto.img },
      });
    else return {};
  }

  async remove(id: number) {
    return this.databaseService.userItem.delete({
      where: { userId_itemId: { userId: id, itemId: id } },
    });
  }
}
