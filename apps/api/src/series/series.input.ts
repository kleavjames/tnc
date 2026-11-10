import { BadRequestException } from '@nestjs/common';

export function parseSeriesTitle(body: unknown): string {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Series body is required');
  }
  const title =
    typeof (body as { title?: unknown }).title === 'string'
      ? (body as { title: string }).title.trim()
      : '';
  if (!title) {
    throw new BadRequestException('Title is required');
  }
  return title;
}
