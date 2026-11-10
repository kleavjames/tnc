import { Module } from '@nestjs/common';
import { ChurchBranchesController } from './church-branches.controller.js';
import { ChurchBranchesService } from './church-branches.service.js';

@Module({
  controllers: [ChurchBranchesController],
  providers: [ChurchBranchesService],
})
export class ChurchBranchesModule {}
