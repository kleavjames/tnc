import { BadRequestException } from '@nestjs/common';

const SITE_CONTENT_ID = 'site';

export type ContentPatch = {
  latestSermon: string;
};

export function parseContentPatch(body: unknown): ContentPatch {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Content body is required');
  }
  const record = body as Record<string, unknown>;
  if (typeof record.latestSermon !== 'string') {
    throw new BadRequestException('latestSermon is required');
  }
  const latestSermon = record.latestSermon.trim();
  if (latestSermon.length > 0 && !isHttpUrl(latestSermon)) {
    throw new BadRequestException('latestSermon must be an http or https URL');
  }
  return { latestSermon };
}

export function siteContentId(): string {
  return SITE_CONTENT_ID;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
