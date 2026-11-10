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

  return {
    title,
    subtitle: text(record.subtitle),
    body: text(record.body),
    verse: text(record.verse),
    tags: tags(record.tags),
    type: oneOf(record.type, ARTICLE_TYPES, 'type'),
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
