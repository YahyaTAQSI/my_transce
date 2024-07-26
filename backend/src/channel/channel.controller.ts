import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Prisma } from '@prisma/client';
import { ChannelDto, updateChannelDto } from './dto/channelDto';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('/dm')
  create(@Body() createChannelDto: ChannelDto) {
    return this.channelService.createDM(createChannelDto);
  }

  @Get('/dm/:id')
  findMyFriends(@Param('id') id: string) {
    return this.channelService.findMyFriends(+id);
  }

  @Get()
  findAll() {
    return this.channelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(+id);
  }

  @Patch('/dm')
  updateDM(@Body() updateChannelDto: updateChannelDto) {
    return this.channelService.updateDM(updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(+id);
  }
}
