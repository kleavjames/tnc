import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { StorageService } from './storage.service.js';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('uploads')
  createUpload(
    @Body() body: { filename?: unknown; contentType?: unknown } | undefined,
  ) {
    return this.storage.createUpload(
      typeof body?.filename === 'string' ? body.filename : '',
      typeof body?.contentType === 'string' ? body.contentType : '',
    );
  }

  @Get('objects')
  list() {
    return this.storage.list();
  }

  @Get('objects/details')
  details(@Query('key') key?: string | string[]) {
    return this.storage.describe(single(key));
  }

  @Get('downloads')
  download(@Query('key') key?: string | string[]) {
    return this.storage.download(single(key));
  }

  @Delete('objects')
  remove(@Query('key') key?: string | string[]) {
    return this.storage.remove(single(key));
  }
}

function single(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}
