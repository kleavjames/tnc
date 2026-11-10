import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChurchBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.churchBranch.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, branch: true },
    });
  }
}
