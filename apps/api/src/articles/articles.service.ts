import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseArticleContent } from './article.input.js';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

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

  create(body: unknown) {
    return this.prisma.article.create({
      data: { ...parseArticleContent(body), articleStatus: 'draft' },
    });
  }

  publishNew(body: unknown) {
    return this.prisma.article.create({
      data: { ...parseArticleContent(body), articleStatus: 'published' },
    });
  }

  update(id: string, body: unknown) {
    return this.write(id, parseArticleContent(body));
  }

  publish(id: string, body: unknown) {
    return this.write(id, {
      ...parseArticleContent(body),
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

function isMissing(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2025'
  );
}
