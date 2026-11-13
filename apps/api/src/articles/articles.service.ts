import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import {
  parseArticleContent,
  type ArticleContent,
  type ArticleLanguage,
} from './article.input.js';

const LANGUAGE_ORDER: ArticleLanguage[] = ['english', 'tagalog', 'cebuano'];

type ArticleStatus = 'draft' | 'unpublish' | 'published';

type PublicArticleRow = {
  id: string;
  title: string;
  subtitle: string;
  verse: string;
  type: 'glc' | 'lnl' | 'sermon';
  uploadedAt: Date;
  sermonDate: Date | null;
  fileKey: string | null;
  imageKey: string | null;
  series: { title: string } | null;
};

type LocaleSummary = {
  language: ArticleLanguage;
  articleStatus: ArticleStatus;
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
        type: true,
        uploadedAt: true,
        imageKey: true,
        series: { select: { title: true } },
        locales: {
          select: {
            language: true,
            title: true,
            subtitle: true,
            verse: true,
            articleStatus: true,
          },
        },
      },
    });

    return articles.map((article) => {
      const english = englishLocale(article.locales);
      return {
        id: article.id,
        title: english?.title ?? '',
        subtitle: english?.subtitle ?? '',
        verse: english?.verse ?? '',
        type: article.type,
        articleStatus: english?.articleStatus ?? 'draft',
        uploadedAt: article.uploadedAt.toISOString(),
        imageKey: article.imageKey,
        series: article.series?.title ?? null,
        locales: sortLocales(article.locales).map((locale) => ({
          language: locale.language,
          articleStatus: locale.articleStatus,
        })),
      };
    });
  }

  async get(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { locales: true },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    const english = englishLocale(article.locales);
    if (!english) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.id,
      title: english.title,
      subtitle: english.subtitle,
      body: english.body,
      verse: english.verse,
      tags: article.tags,
      type: article.type,
      articleStatus: english.articleStatus,
      sermonDate: article.sermonDate?.toISOString() ?? null,
      uploadedAt: article.uploadedAt.toISOString(),
      imageKey: article.imageKey,
      fileKey: english.fileKey,
      videoLink: article.videoLink,
      audioLink: article.audioLink,
      seriesId: article.seriesId,
      locales: sortLocales(article.locales).map((locale) => ({
        language: locale.language,
        title: locale.title,
        subtitle: locale.subtitle,
        body: locale.body,
        verse: locale.verse,
        articleStatus: locale.articleStatus,
        fileKey: locale.fileKey,
      })),
    };
  }

  async listPublished() {
    const articles = await this.prisma.article.findMany({
      where: {
        locales: { some: { articleStatus: 'published' } },
      },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        type: true,
        uploadedAt: true,
        sermonDate: true,
        imageKey: true,
        series: { select: { title: true } },
        locales: {
          where: { articleStatus: 'published' },
          select: {
            language: true,
            title: true,
            subtitle: true,
            verse: true,
            articleStatus: true,
            fileKey: true,
          },
        },
      },
    });

    return articles.flatMap((article) => {
      const locales = sortLocales(article.locales);
      const locale = preferredLocale(locales);
      if (!locale) {
        return [];
      }
      return [
        {
          ...publicSummary({
            id: article.id,
            title: locale.title,
            subtitle: locale.subtitle,
            verse: locale.verse,
            type: article.type,
            uploadedAt: article.uploadedAt,
            sermonDate: article.sermonDate,
            fileKey: locale.fileKey,
            imageKey: article.imageKey,
            series: article.series,
          }),
          locales: locales.map(publicLocale),
        },
      ];
    });
  }

  async getPublished(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        tags: true,
        type: true,
        uploadedAt: true,
        sermonDate: true,
        imageKey: true,
        videoLink: true,
        audioLink: true,
        series: { select: { title: true } },
        locales: {
          select: {
            language: true,
            title: true,
            subtitle: true,
            body: true,
            verse: true,
            articleStatus: true,
            fileKey: true,
          },
        },
      },
    });
    const locales = sortLocales(
      article?.locales.filter((locale) => locale.articleStatus === 'published') ??
        [],
    );
    const locale = preferredLocale(locales);
    if (!article || !locale) {
      throw new NotFoundException('Article not found');
    }

    return {
      ...publicSummary({
        id: article.id,
        title: locale.title,
        subtitle: locale.subtitle,
        verse: locale.verse,
        type: article.type,
        uploadedAt: article.uploadedAt,
        sermonDate: article.sermonDate,
        fileKey: locale.fileKey,
        imageKey: article.imageKey,
        series: article.series,
      }),
      body: locale.body,
      tags: article.tags,
      fileName: fileName(locale.fileKey),
      videoLink: article.videoLink,
      audioLink: article.audioLink,
      locales: locales.map((item) => ({
        ...publicLocale(item),
        body: item.body,
        fileName: fileName(item.fileKey),
      })),
    };
  }

  async publishedFile(id: string, language: ArticleLanguage = 'english') {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        locales: {
          select: { language: true, articleStatus: true, fileKey: true },
        },
      },
    });
    const locale = article?.locales.find((item) => item.language === language);
    if (
      !locale ||
      locale.articleStatus !== 'published' ||
      !locale.fileKey
    ) {
      throw new NotFoundException('Article not found');
    }

    return this.storage.download(locale.fileKey);
  }

  async publishedCover(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: {
        imageKey: true,
        locales: {
          select: { articleStatus: true },
        },
      },
    });
    const published = article?.locales.some(
      (locale) => locale.articleStatus === 'published',
    );
    if (!article || !published || !article.imageKey) {
      throw new NotFoundException('Article not found');
    }

    return this.storage.view(article.imageKey);
  }

  async create(body: unknown) {
    return this.createWithStatus(body, 'draft');
  }

  async publishNew(body: unknown) {
    return this.createWithStatus(body, 'published');
  }

  async update(id: string, body: unknown) {
    return this.saveLocale(id, await this.articleData(body), null);
  }

  async publish(id: string, body: unknown) {
    return this.saveLocale(id, await this.articleData(body), 'published');
  }

  async unpublish(id: string, body: unknown) {
    return this.saveLocale(id, await this.articleData(body), 'unpublish', {
      requireExisting: true,
    });
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

  private async createWithStatus(
    body: unknown,
    articleStatus: 'draft' | 'published',
  ) {
    const data = await this.articleData(body);
    if (data.language !== 'english') {
      throw new BadRequestException(
        'Save the English article before adding another language',
      );
    }
    const article = await this.prisma.article.create({
      data: {
        ...sharedData(data),
        locales: {
          create: {
            language: 'english',
            ...localeFields(data),
            articleStatus,
          },
        },
      },
      select: {
        id: true,
        locales: { select: { articleStatus: true } },
      },
    });
    const english = article.locales[0];
    if (!english) {
      throw new NotFoundException('Article not found');
    }
    return { id: article.id, articleStatus: english.articleStatus };
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

  private async saveLocale(
    id: string,
    data: ArticleContent,
    status: ArticleStatus | null,
    options?: { requireExisting?: boolean },
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.article.update({
          where: { id },
          data: sharedData(data),
        });
        const existing = await tx.articleLocale.findUnique({
          where: {
            articleId_language: { articleId: id, language: data.language },
          },
          select: { articleStatus: true },
        });
        if (options?.requireExisting && !existing) {
          throw new NotFoundException('Article not found');
        }
        const articleStatus = status ?? existing?.articleStatus ?? 'draft';
        const locale = await tx.articleLocale.upsert({
          where: {
            articleId_language: { articleId: id, language: data.language },
          },
          create: {
            articleId: id,
            language: data.language,
            ...localeFields(data),
            articleStatus,
          },
          update: {
            ...localeFields(data),
            articleStatus,
          },
        });
        return { id, articleStatus: locale.articleStatus };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (isMissing(error)) {
        throw new NotFoundException('Article not found');
      }
      throw error;
    }
  }
}

function sharedData(data: ArticleContent) {
  return {
    tags: data.tags,
    type: data.type,
    sermonDate: data.sermonDate,
    imageKey: data.imageKey,
    videoLink: data.videoLink,
    audioLink: data.audioLink,
    seriesId: data.seriesId,
  };
}

function localeFields(data: ArticleContent) {
  return {
    title: data.title,
    subtitle: data.subtitle,
    body: data.body,
    verse: data.verse,
    fileKey: data.fileKey,
  };
}

function publicLocale(locale: {
  language: ArticleLanguage;
  title: string;
  subtitle: string;
  verse: string;
  fileKey: string | null;
}) {
  return {
    language: locale.language,
    title: locale.title,
    subtitle: locale.subtitle,
    verse: locale.verse,
    hasFile: Boolean(locale.fileKey),
  };
}

function preferredLocale<T extends { language: string }>(
  locales: T[],
): T | undefined {
  return englishLocale(locales) ?? locales[0];
}

function englishLocale<T extends { language: string }>(
  locales: T[],
): T | undefined {
  return locales.find((locale) => locale.language === 'english');
}

function sortLocales<T extends LocaleSummary>(locales: T[]): T[] {
  return [...locales].sort(
    (a, b) =>
      LANGUAGE_ORDER.indexOf(a.language) - LANGUAGE_ORDER.indexOf(b.language),
  );
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
    hasImage: Boolean(article.imageKey),
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
