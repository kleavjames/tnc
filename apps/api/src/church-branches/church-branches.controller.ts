import { Controller, Get } from '@nestjs/common';
import { ChurchBranchesService } from './church-branches.service.js';

@Controller('church-branches')
export class ChurchBranchesController {
  constructor(private readonly branches: ChurchBranchesService) {}

  @Get()
  list() {
    return this.branches.list();
  }
}
