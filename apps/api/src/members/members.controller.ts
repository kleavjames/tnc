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
import { MembersService } from './members.service.js';

@Controller('members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.members.create(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  list(
    @Query()
    query: { approved?: unknown; branchId?: unknown; search?: unknown },
  ) {
    return this.members.list(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  get(@Param('id') id: string) {
    return this.members.get(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.members.update(id, body);
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard)
  approve(@Param('id') id: string) {
    return this.members.approve(id);
  }

  @Post(':id/unapprove')
  @UseGuards(AuthGuard)
  unapprove(@Param('id') id: string) {
    return this.members.unapprove(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.members.remove(id);
  }
}
