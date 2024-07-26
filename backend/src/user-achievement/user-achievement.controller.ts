import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserAchievementService } from './user-achievement.service';
import { Prisma } from '@prisma/client';

@Controller('user-achievement')
export class UserAchievementController {
  constructor(
    private readonly userAchievementService: UserAchievementService,
  ) {}

  @Post()
  create(
    @Body()
    createUserAchievementDto: Prisma.UserAchievementUncheckedCreateInput,
  ) {
    return this.userAchievementService.create(createUserAchievementDto);
  }
 

  @Get()
  findAll() {
    return this.userAchievementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAchievementService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserAchievementDto: Prisma.UserAchievementUpdateInput,
  ) {
    return this.userAchievementService.update(+id, updateUserAchievementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAchievementService.remove(+id);
  }
}
