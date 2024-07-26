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
import { MatchHistoryService } from './match-history.service';
import { Prisma } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@Controller('match-history')
export class MatchHistoryController {
  constructor(private readonly matchHistoryService: MatchHistoryService) {}

  @Public()
  @Post()
  create(@Body() createMatchHistoryDto: Prisma.MatchHistoryCreateInput) {
    console.log('dataatat, ', createMatchHistoryDto);
    return this.matchHistoryService.create(createMatchHistoryDto);
  }

  @Get()
  findAll(@Query('id') id: string) {
    console.log('hana 1111');

    if (id) {
      return this.matchHistoryService.findMatchOfUser(+id);
    }
    return this.matchHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('hana 122222');
    return this.matchHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMatchHistoryDto: Prisma.MatchHistoryUpdateInput,
  ) {
    return this.matchHistoryService.update(+id, updateMatchHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchHistoryService.remove(+id);
  }
}
