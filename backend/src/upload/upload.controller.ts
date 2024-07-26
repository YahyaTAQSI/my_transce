import {
  Controller,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { UploadService } from './upload.service';

@Public()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':uid')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @Param('uid') uid: string,
    @Query('type') type: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files) {
      return { message: 'No file uploaded' };
    }

    const value = await this.uploadService.saveFile(+uid, files[0]);
    return this.uploadService.updateUser(+uid, type, value);
  }
}
