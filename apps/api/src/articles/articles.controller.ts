import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ArticlesService } from './articles.service.js';

@Controller('articles')
@UseGuards(AuthGuard)
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  list() {
    return this.articles.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.articles.get(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.articles.create(body);
  }

  @Post('publish')
  publishNew(@Body() body: unknown) {
    return this.articles.publishNew(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.articles.update(id, body);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Body() body: unknown) {
    return this.articles.publish(id, body);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.articles.unpublish(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articles.remove(id);
  }
}
