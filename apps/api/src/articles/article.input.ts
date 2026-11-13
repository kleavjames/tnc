import { BadRequestException } from '@nestjs/common';

const ARTICLE_TYPES = ['glc', 'lnl', 'sermon'] as const;
const ARTICLE_LANGUAGES = ['english', 'tagalog', 'cebuano'] as const;

type ArticleType = (typeof ARTICLE_TYPES)[number];
export type ArticleLanguage = (typeof ARTICLE_LANGUAGES)[number];

export type ArticleContent = {
  language: ArticleLanguage;
  title: string;
  subtitle: string;
  body: string;
  verse: string;
  tags: string[];
  type: ArticleType;
  sermonDate: Date;
  imageKey: string | null;
  fileKey: string | null;
  videoLink: string | null;
  audioLink: string | null;
  seriesId: string | null;
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
    language: articleLanguage(record.language),
    title,
    subtitle: text(record.subtitle),
    body: text(record.body),
    verse: text(record.verse),
    tags: tags(record.tags),
    type,
    sermonDate: sermonDate(record.sermonDate),
    imageKey: optionalKey(record.imageKey),
    fileKey: optionalKey(record.fileKey),
    videoLink: optionalUrl(record.videoLink, 'videoLink'),
    audioLink: optionalUrl(record.audioLink, 'audioLink'),
    seriesId: optionalSeriesId(record.seriesId),
  };
}

export function parseLanguageQuery(value: unknown): ArticleLanguage {
  return articleLanguage(value);
}

function articleLanguage(value: unknown): ArticleLanguage {
  if (value === undefined || value === null || value === '') {
    return 'english';
  }
  return oneOf(value, ARTICLE_LANGUAGES, 'language');
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

function optionalSeriesId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const id = value.trim();
  if (!id || id === 'none') {
    return null;
  }
  return id;
}

function optionalUrl(value: unknown, field: string): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const url = value.trim();
  if (!url) {
    return null;
  }
  if (!isHttpUrl(url)) {
    throw new BadRequestException(`${field} must be an http or https URL`);
  }
  return url;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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
