import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseSeriesTitle } from './series.input.js';

const seriesSelect = { id: true, title: true } as const;

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.series.findMany({
      orderBy: { createdAt: 'asc' },
      select: seriesSelect,
    });
  }

  async create(body: unknown) {
    const title = parseSeriesTitle(body);
    const existing = await this.prisma.series.findFirst({
      where: { title: { equals: title, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('A series with that title already exists');
    }

    try {
      return await this.prisma.series.create({
        data: { title },
        select: seriesSelect,
      });
    } catch (error) {
      if (isUnique(error)) {
        throw new BadRequestException(
          'A series with that title already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.series.delete({ where: { id } });
    } catch (error) {
      if (isMissing(error)) {
        throw new NotFoundException('Series not found');
      }
      throw error;
    }
    return { deleted: true as const };
  }
}

function isUnique(error: unknown): boolean {
  return prismaCode(error) === 'P2002';
}

function isMissing(error: unknown): boolean {
  return prismaCode(error) === 'P2025';
}

function prismaCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return null;
}
