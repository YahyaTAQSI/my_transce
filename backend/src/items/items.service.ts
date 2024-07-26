import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ItemsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createItemDto: Prisma.ItemCreateInput) {
    return this.databaseService.item.create({ data: createItemDto });
  }

  async findAll() {
    console.log('hello world');
    return this.databaseService.item.findMany({});
  }

  async findOne(id: number) {
    return this.databaseService.item.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateItemDto: Prisma.ItemUpdateInput) {
    return this.databaseService.item.update({
      where: { id },
      data: updateItemDto,
    });
  }

  remove(id: number) {
    return this.databaseService.item.delete({ where: { id } });
  }
}
