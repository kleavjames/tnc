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
import { GlcService } from './glc.service.js';

@Controller('glc')
@UseGuards(AuthGuard)
export class GlcController {
  constructor(private readonly glc: GlcService) {}

  @Get('attendance')
  listAttendance() {
    return this.glc.listAttendance();
  }

  @Post('members/:memberId/progress')
  start(@Param('memberId') memberId: string) {
    return this.glc.start(memberId);
  }

  @Get('members/:memberId/progress')
  getProgress(@Param('memberId') memberId: string) {
    return this.glc.getProgress(memberId);
  }

  @Patch('members/:memberId/sessions/:sessionId')
  setAttended(
    @Param('memberId') memberId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: unknown,
  ) {
    return this.glc.setAttended(memberId, sessionId, body);
  }

  @Delete('members/:memberId/progress')
  remove(@Param('memberId') memberId: string) {
    return this.glc.remove(memberId);
  }
}
