import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';

@Controller('channelss')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseInterceptors(AnyFilesInterceptor())
  @Post()
  create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('userId') userId: string,
    @Body() createChannelDto: Prisma.ChannelCreateInput,
  ) {
    createChannelDto.code = parseInt(createChannelDto.code.toString());
    console.log('createChannelDto ==> ', createChannelDto);
    return this.channelsService.create(files[0], createChannelDto, userId);
  }

  @Get()
  findAll(@Query('mustinclude') text: string) {
    console.log('Text:', text);
    return this.channelsService.findAll(text);
  }
  @Get('messages')
  findMessages(@Query('channelId') channelId: string) {
    return this.channelsService.findMessages(+channelId);
  }
  @Get('roles')
  getRoles(@Query('channelId') channelId: string) {
    return this.channelsService.getRoles(+channelId);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(+id);
  }

  @Patch('makeadmin')
  makeAdmin(
    @Query('channelId') channelId: string,
    @Query('userId') userId: string,
  ) {
    return this.channelsService.makeAdmin(+channelId, +userId);
  }
  @Patch('rmadmin')
  rmAdmin(
    @Query('channelId') channelId: string,
    @Query('userId') userId: string,
  ) {
    return this.channelsService.rmAdmin(+channelId, +userId);
  }
  @Patch('joinpublic')
  joinPublic(
    @Query('channelID') channelId: string,
    @Query('userID') userId: string,
  ) {
    return this.channelsService.joinPublic(+channelId, +userId);
  }
  @Patch('leave')
  Leave(
    @Query('channelId') channelId: string,
    @Query('userId') userId: string,
  ) {
    return this.channelsService.leave(+channelId, +userId);
  }
  @Patch('kick')
  kick(@Query('channelId') channelId: string, @Query('userId') userId: string) {
    console.log('PLLLZZ');
    return this.channelsService.kick(+channelId, +userId);
  }
  @Patch('mute')
  Mute(@Query('channelId') channelId: string, @Query('userId') userId: string) {
    return this.channelsService.mute(+channelId, +userId);
  }
  @Patch('rmmute')
  rmMute(
    @Query('channelId') channelId: string,
    @Query('userId') userId: string,
  ) {
    return this.channelsService.rmMute(+channelId, +userId);
  }
  @Patch('block')
  Block(
    @Query('channelId') channelId: string,
    @Query('userId') userId: string,
  ) {
    return this.channelsService.block(+channelId, +userId);
  }
  @Patch('rmblock')
  RmBlock(
    @Query('channelId') channelId: string,
    @Query('userId') userId: string,
  ) {
    return this.channelsService.rmblock(+channelId, +userId);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelsService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(+id);
  }
}
