import { randomUUID } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';

const REQUIRED_ENV = [
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_S3_API',
] as const;

export const UPLOAD_PREFIX = 'uploads/';
export const URL_TTL_SECONDS = 900;

export type R2Config = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
};

export function r2ConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): R2Config {
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = env.R2_BUCKET?.trim();
  const endpoint = env.R2_S3_API?.trim().replace(/\/$/, '');
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    const missing = REQUIRED_ENV.filter((name) => !env[name]?.trim());
    throw new Error(
      `R2 configuration is incomplete. Set ${missing.join(', ')}.`,
    );
  }

  return { accessKeyId, secretAccessKey, bucket, endpoint };
}

export function safeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop()?.trim() ?? '';
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '');
  const trimmed = cleaned.slice(0, 180);
  if (!trimmed) {
    throw new BadRequestException('filename is required');
  }

  return trimmed;
}

export function objectKeyFor(filename: string): string {
  return `${UPLOAD_PREFIX}${randomUUID()}/${safeFilename(filename)}`;
}

export function assertUploadKey(key: string): void {
  const valid =
    key.startsWith(UPLOAD_PREFIX) &&
    key.length > UPLOAD_PREFIX.length &&
    !key.includes('..') &&
    !key.includes('\\') &&
    !key.includes('//');
  if (!valid) {
    throw new BadRequestException('invalid object key');
  }
}

export function contentTypeOrDefault(contentType: string): string {
  const type = contentType.trim() || 'application/octet-stream';
  if (type.length > 200 || /[\r\n]/.test(type) || !type.includes('/')) {
    throw new BadRequestException('contentType is invalid');
  }

  return type;
}

export function attachmentDisposition(key: string): string {
  const name = key.split('/').pop()?.replace(/["\\\r\n]/g, '') || 'download';
  return `attachment; filename="${name}"`;
}
