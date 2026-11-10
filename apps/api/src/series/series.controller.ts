import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { SeriesService } from './series.service.js';

@Controller('series')
@UseGuards(AuthGuard)
export class SeriesController {
  constructor(private readonly series: SeriesService) {}

  @Get()
  list() {
    return this.series.list();
  }

  @Post()
  create(@Body() body: unknown) {
    return this.series.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.series.remove(id);
  }
}
