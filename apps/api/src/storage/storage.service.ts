import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  URL_TTL_SECONDS,
  UPLOAD_PREFIX,
  assertUploadKey,
  attachmentDisposition,
  contentTypeOrDefault,
  objectKeyFor,
  r2ConfigFromEnv,
  type R2Config,
} from './storage.keys.js';

export type SignedUrl = {
  url: string;
  expiresAt: string;
};

export type UploadTicket = SignedUrl & {
  key: string;
};

export type StoredObject = {
  key: string;
  size: number;
  lastModified: string | null;
};

@Injectable()
export class StorageService {
  private readonly config: R2Config;
  private readonly client: S3Client;

  constructor() {
    this.config = r2ConfigFromEnv();
    this.client = new S3Client({
      region: 'auto',
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      // Presigned browser uploads cannot send the default CRC32 checksum header.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async createUpload(
    filename: string,
    contentType: string,
  ): Promise<UploadTicket> {
    const key = objectKeyFor(filename);
    const type = contentTypeOrDefault(contentType);
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: type,
      }),
      { expiresIn: URL_TTL_SECONDS },
    );

    return { key, url, expiresAt: expiresAt() };
  }

  async list(): Promise<{ objects: StoredObject[] }> {
    const result = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: UPLOAD_PREFIX,
        MaxKeys: 100,
      }),
    );

    const objects = (result.Contents ?? [])
      .flatMap((item) => {
        if (!item.Key || item.Key.endsWith('/')) {
          return [];
        }

        return [
          {
            key: item.Key,
            size: item.Size ?? 0,
            lastModified: item.LastModified?.toISOString() ?? null,
          },
        ];
      })
      .sort((a, b) => {
        if (a.lastModified === b.lastModified) {
          return a.key < b.key ? 1 : -1;
        }
        return (b.lastModified ?? '') < (a.lastModified ?? '') ? -1 : 1;
      });

    return { objects };
  }

  async download(key: string): Promise<SignedUrl> {
    assertUploadKey(key);
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ResponseContentDisposition: attachmentDisposition(key),
      }),
      { expiresIn: URL_TTL_SECONDS },
    );

    return { url, expiresAt: expiresAt() };
  }

  async remove(key: string): Promise<{ deleted: true }> {
    assertUploadKey(key);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );

    return { deleted: true };
  }
}

function expiresAt(): string {
  return new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString();
}
