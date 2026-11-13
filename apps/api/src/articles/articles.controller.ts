import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { parseLanguageQuery } from './article.input.js';
import { ArticlesService } from './articles.service.js';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get('published')
  listPublished() {
    return this.articles.listPublished();
  }

  @Get('published/:id')
  getPublished(@Param('id') id: string) {
    return this.articles.getPublished(id);
  }

  @Get('published/:id/file')
  publishedFile(
    @Param('id') id: string,
    @Query('language') language?: string,
  ) {
    return this.articles.publishedFile(id, parseLanguageQuery(language));
  }

  @Get('published/:id/cover')
  publishedCover(@Param('id') id: string) {
    return this.articles.publishedCover(id);
  }

  @Get()
  @UseGuards(AuthGuard)
  list() {
    return this.articles.list();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  get(@Param('id') id: string) {
    return this.articles.get(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: unknown) {
    return this.articles.create(body);
  }

  @Post('publish')
  @UseGuards(AuthGuard)
  publishNew(@Body() body: unknown) {
    return this.articles.publishNew(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.articles.update(id, body);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard)
  publish(@Param('id') id: string, @Body() body: unknown) {
    return this.articles.publish(id, body);
  }

  @Post(':id/unpublish')
  @UseGuards(AuthGuard)
  unpublish(@Param('id') id: string, @Body() body: unknown) {
    return this.articles.unpublish(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.articles.remove(id);
  }
}
