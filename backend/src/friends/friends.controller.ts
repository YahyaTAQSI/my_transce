import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Prisma } from '@prisma/client';
import { FriendDto } from './dto/friendDto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  create(@Body() createFriendDto: FriendDto) {
    return this.friendsService.create(createFriendDto);
  }

  @Get()
  findAll() {
    return this.friendsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendsService.findOne(+id);
  }
  @Get('/allusers/:id')
  findAllExceptFriends(@Param('id') id: string) {
    return this.friendsService.findAllExceptFriends(+id);
  }

  @Get('/me/:id')
  findIfFriend(@Param('id') id: number, @Query('friendId') friendId: number) {
    return this.friendsService.findIfFriedn(+id, +friendId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('friendId') friendId: number,
    @Body() updateFriendDto: Prisma.UserFriendUpdateInput,
  ) {
    return this.friendsService.update(+id, +friendId, updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(+id);
  }
}
