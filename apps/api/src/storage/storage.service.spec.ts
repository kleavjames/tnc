import { BadRequestException } from '@nestjs/common';
import { HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service.js';
import { r2ConfigFromEnv } from './storage.keys.js';

const ENV_KEYS = [
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_S3_API',
] as const;

describe('r2ConfigFromEnv', () => {
  it('names the missing variables', () => {
    expect(() => r2ConfigFromEnv({})).toThrow(
      'R2 configuration is incomplete. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_S3_API.',
    );
  });
});

describe('StorageService', () => {
  const previous: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> =
    {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      previous[key] = process.env[key];
    }
    process.env.R2_ACCESS_KEY_ID = 'test-access-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.R2_BUCKET = 'test-bucket';
    process.env.R2_S3_API = 'https://example.r2.cloudflarestorage.com';
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  });

  it('strips paths and unsafe characters from upload names', async () => {
    const service = new StorageService();
    const upload = await service.createUpload(
      '../sermons/my sermon.mp3',
      'audio/mpeg',
    );

    expect(upload.key).toMatch(
      /^uploads\/[0-9a-f-]{36}\/my_sermon\.mp3$/,
    );
    expect(upload.key.includes('..')).toBe(false);
    expect(upload.url).toContain(encodeURIComponent(upload.key).replace(/%2F/g, '/'));
    expect(upload.expiresAt).toEqual(expect.any(String));
  });

  it('rejects an empty filename', async () => {
    const service = new StorageService();

    await expect(service.createUpload('   ', 'text/plain')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('reads the size and type of an uploaded object', async () => {
    const service = new StorageService();
    const send = vi.spyOn(service['client'], 'send').mockResolvedValue({
      ContentLength: 2048,
      ContentType: 'application/pdf',
    } as never);

    await expect(service.describe('uploads/id/notes.pdf')).resolves.toEqual({
      size: 2048,
      contentType: 'application/pdf',
    });
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(HeadObjectCommand);
    expect(send.mock.calls[0]?.[0].input).toMatchObject({
      Bucket: 'test-bucket',
      Key: 'uploads/id/notes.pdf',
    });
  });

  it('rejects object keys outside uploads/', async () => {
    const service = new StorageService();
    const send = vi.spyOn(service['client'], 'send');

    await expect(service.download('../secrets.txt')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.remove('uploads/../secrets.txt')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.download('uploads/')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('lists only file objects under uploads/', async () => {
    const service = new StorageService();
    const send = vi.spyOn(service['client'], 'send').mockResolvedValue({
      Contents: [
        {
          Key: 'uploads/older.txt',
          Size: 4,
          LastModified: new Date('2026-01-01T00:00:00.000Z'),
        },
        { Key: 'uploads/', Size: 0 },
        {
          Key: 'uploads/newer.txt',
          Size: 8,
          LastModified: new Date('2026-02-01T00:00:00.000Z'),
        },
      ],
    } as never);

    await expect(service.list()).resolves.toEqual({
      objects: [
        {
          key: 'uploads/newer.txt',
          size: 8,
          lastModified: '2026-02-01T00:00:00.000Z',
        },
        {
          key: 'uploads/older.txt',
          size: 4,
          lastModified: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(ListObjectsV2Command);
    expect(send.mock.calls[0]?.[0].input).toMatchObject({
      Bucket: 'test-bucket',
      Prefix: 'uploads/',
      MaxKeys: 100,
    });
  });
});
