import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { GlcController } from './glc.controller.js';
import { GlcService } from './glc.service.js';

@Module({
  imports: [AuthModule],
  controllers: [GlcController],
  providers: [GlcService],
})
export class GlcModule {}
