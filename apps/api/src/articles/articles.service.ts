import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { parseArticleContent } from './article.input.js';

type PublicArticleRow = {
  id: string;
  title: string;
  subtitle: string;
  verse: string;
  type: 'glc' | 'lnl' | 'sermon';
  uploadedAt: Date;
  sermonDate: Date | null;
  fileKey: string | null;
  series: { title: string } | null;
};

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list() {
    const articles = await this.prisma.article.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        verse: true,
        type: true,
        articleStatus: true,
        uploadedAt: true,
        series: { select: { title: true } },
      },
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      verse: article.verse,
      type: article.type,
      articleStatus: article.articleStatus,
      uploadedAt: article.uploadedAt.toISOString(),
      series: article.series?.title ?? null,
    }));
  }

  async get(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async listPublished() {
    const articles = await this.prisma.article.findMany({
      where: { articleStatus: 'published' },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        verse: true,
        type: true,
        uploadedAt: true,
        sermonDate: true,
        fileKey: true,
        series: { select: { title: true } },
      },
    });

    return articles.map(publicSummary);
  }

  async getPublished(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        body: true,
        verse: true,
        tags: true,
        type: true,
        articleStatus: true,
        uploadedAt: true,
        sermonDate: true,
        fileKey: true,
        videoLink: true,
        audioLink: true,
        series: { select: { title: true } },
      },
    });
    if (!article || article.articleStatus !== 'published') {
      throw new NotFoundException('Article not found');
    }

    return {
      ...publicSummary(article),
      body: article.body,
      tags: article.tags,
      fileName: fileName(article.fileKey),
      videoLink: article.videoLink,
      audioLink: article.audioLink,
    };
  }

  async publishedFile(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { articleStatus: true, fileKey: true },
    });
    if (
      !article ||
      article.articleStatus !== 'published' ||
      !article.fileKey
    ) {
      throw new NotFoundException('Article not found');
    }

    return this.storage.download(article.fileKey);
  }

  async create(body: unknown) {
    return this.prisma.article.create({
      data: { ...(await this.articleData(body)), articleStatus: 'draft' },
    });
  }

  async publishNew(body: unknown) {
    return this.prisma.article.create({
      data: { ...(await this.articleData(body)), articleStatus: 'published' },
    });
  }

  async update(id: string, body: unknown) {
    return this.write(id, await this.articleData(body));
  }

  async publish(id: string, body: unknown) {
    return this.write(id, {
      ...(await this.articleData(body)),
      articleStatus: 'published',
    });
  }

  unpublish(id: string) {
    return this.write(id, { articleStatus: 'unpublish' });
  }

  async remove(id: string) {
    try {
      await this.prisma.article.delete({ where: { id } });
    } catch (error) {
      if (isMissing(error)) {
        throw new NotFoundException('Article not found');
      }
      throw error;
    }
    return { deleted: true as const };
  }

  private async articleData(body: unknown) {
    const data = parseArticleContent(body);
    if (!data.seriesId) {
      return data;
    }
    const series = await this.prisma.series.findUnique({
      where: { id: data.seriesId },
      select: { id: true },
    });
    if (!series) {
      throw new BadRequestException('seriesId is invalid');
    }
    return data;
  }

  private async write(
    id: string,
    data: Parameters<PrismaService['article']['update']>[0]['data'],
  ) {
    try {
      return await this.prisma.article.update({ where: { id }, data });
    } catch (error) {
      if (isMissing(error)) {
        throw new NotFoundException('Article not found');
      }
      throw error;
    }
  }
}

function publicSummary(article: PublicArticleRow) {
  return {
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    verse: article.verse,
    type: article.type,
    uploadedAt: article.uploadedAt.toISOString(),
    sermonDate: article.sermonDate?.toISOString() ?? null,
    series: article.series?.title ?? null,
    hasFile: Boolean(article.fileKey),
  };
}

function fileName(fileKey: string | null): string | null {
  if (!fileKey) {
    return null;
  }
  const name = fileKey.split('/').pop();
  return name ? name : null;
}

function isMissing(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2025'
  );
}
