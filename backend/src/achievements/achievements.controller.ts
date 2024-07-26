import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { Prisma } from '@prisma/client';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  create(@Body() createAchievementDto: Prisma.AchievementCreateInput) {
    return this.achievementsService.create(createAchievementDto);
  }
  @Post('/createall')
  createMany(
    @Body()
    createAllAchievementDto: Prisma.AchievementUncheckedCreateInput,
  ) {
    return this.achievementsService.createMany(createAllAchievementDto);
  }
  @Get()
  findAll() {
    return this.achievementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAchievementDto: Prisma.AchievementUpdateInput,
  ) {
    return this.achievementsService.update(+id, updateAchievementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.achievementsService.remove(+id);
  }
}
