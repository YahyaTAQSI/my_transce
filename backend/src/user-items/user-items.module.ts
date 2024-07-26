import { Module } from '@nestjs/common';
import { UserItemsService } from './user-items.service';
import { UserItemsController } from './user-items.controller';

@Module({
  controllers: [UserItemsController],
  providers: [UserItemsService],
})
export class UserItemsModule {}
