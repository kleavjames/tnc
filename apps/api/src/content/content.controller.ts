import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ContentService } from './content.service.js';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('public')
  getPublic() {
    return this.content.getPublic();
  }

  @Get()
  @UseGuards(AuthGuard)
  get() {
    return this.content.get();
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() body: unknown) {
    return this.content.update(body);
  }
}
