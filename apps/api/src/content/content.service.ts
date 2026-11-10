import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseContentPatch, siteContentId } from './content.input.js';

export type PublicContent = {
  latestSermon: string;
};

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(): Promise<PublicContent> {
    return this.read();
  }

  async get(): Promise<PublicContent> {
    return this.read();
  }

  async update(body: unknown): Promise<PublicContent> {
    const patch = parseContentPatch(body);
    await this.prisma.content.upsert({
      where: { id: siteContentId() },
      create: { id: siteContentId(), latestSermon: patch.latestSermon },
      update: patch,
    });
    return patch;
  }

  private async read(): Promise<PublicContent> {
    const row = await this.prisma.content.upsert({
      where: { id: siteContentId() },
      create: { id: siteContentId() },
      update: {},
      select: { latestSermon: true },
    });
    return { latestSermon: row.latestSermon };
  }
}
