import { BadRequestException } from '@nestjs/common';

const ARTICLE_TYPES = ['glc', 'lnl', 'sermon'] as const;

type ArticleType = (typeof ARTICLE_TYPES)[number];

export type ArticleContent = {
  title: string;
  subtitle: string;
  body: string;
  verse: string;
  tags: string[];
  type: ArticleType;
  sermonDate: Date;
  imageKey: string | null;
  fileKey: string | null;
};

export function parseArticleContent(body: unknown): ArticleContent {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Article body is required');
  }

  const record = body as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!title) {
    throw new BadRequestException('Title is required');
  }

  const type = oneOf(record.type, ARTICLE_TYPES, 'type');

  return {
    title,
    subtitle: text(record.subtitle),
    body: text(record.body),
    verse: text(record.verse),
    tags: tags(record.tags),
    type,
    sermonDate: sermonDate(record.sermonDate),
    imageKey: optionalKey(record.imageKey),
    fileKey: optionalKey(record.fileKey),
  };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function tags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function sermonDate(value: unknown): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('sermonDate is required');
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException('sermonDate is invalid');
  }
  return date;
}

function optionalKey(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  if (typeof value === 'string' && allowed.includes(value as T)) {
    return value as T;
  }
  throw new BadRequestException(`${field} is invalid`);
}
