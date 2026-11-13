import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service.js';

const published = {
  id: 'a1',
  title: 'Room for Him',
  subtitle: 'Advent',
  body: '<p>Hello</p>',
  verse: 'Luke 2:1-7',
  tags: ['advent'],
  type: 'sermon' as const,
  articleStatus: 'published' as const,
  uploadedAt: new Date('2025-12-14T00:00:00.000Z'),
  sermonDate: new Date('2025-12-07T00:00:00.000Z'),
  imageKey: 'uploads/cover.jpg',
  fileKey: 'uploads/id/notes.pdf',
  videoLink: 'https://youtube.com/live/tn-dec28',
  audioLink: 'https://open.spotify.com/episode/tn',
  series: { title: 'Emmanuel' },
};

function service(
  prisma: object,
  storage: {
    download?: (key: string) => Promise<unknown>;
    view?: (key: string) => Promise<unknown>;
  } = {
    download: async () => ({
      url: 'https://files.example/notes.pdf',
      expiresAt: 'soon',
    }),
  },
) {
  return new ArticlesService(prisma as never, storage as never);
}

describe('admin article list', () => {
  it('includes each cover image key', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'a1',
        title: 'Room for Him',
        subtitle: 'Advent',
        verse: 'Luke 2:1-7',
        type: 'sermon',
        articleStatus: 'draft',
        uploadedAt: new Date('2025-12-14T00:00:00.000Z'),
        imageKey: 'uploads/cover.jpg',
        series: { title: 'Emmanuel' },
      },
      {
        id: 'a2',
        title: 'Notes',
        subtitle: '',
        verse: 'John 1',
        type: 'glc',
        articleStatus: 'published',
        uploadedAt: new Date('2025-12-15T00:00:00.000Z'),
        imageKey: null,
        series: null,
      },
    ]);

    const list = await service({ article: { findMany } }).list();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({ imageKey: true }),
      }),
    );
    expect(list).toEqual([
      expect.objectContaining({
        id: 'a1',
        imageKey: 'uploads/cover.jpg',
        series: 'Emmanuel',
      }),
      expect.objectContaining({ id: 'a2', imageKey: null, series: null }),
    ]);
  });
});

describe('published articles', () => {
  it('lists published articles without storage keys or body', async () => {
    const findMany = vi.fn().mockResolvedValue([
      published,
      {
        ...published,
        id: 'a2',
        fileKey: null,
        imageKey: null,
        series: null,
      },
    ]);
    const list = await service({ article: { findMany } }).listPublished();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { articleStatus: 'published' },
        orderBy: { uploadedAt: 'desc' },
      }),
    );
    expect(list[0]).toEqual({
      id: 'a1',
      title: 'Room for Him',
      subtitle: 'Advent',
      verse: 'Luke 2:1-7',
      type: 'sermon',
      uploadedAt: '2025-12-14T00:00:00.000Z',
      sermonDate: '2025-12-07T00:00:00.000Z',
      series: 'Emmanuel',
      hasFile: true,
      hasImage: true,
    });
    expect(list[1]).toMatchObject({
      series: null,
      hasFile: false,
      hasImage: false,
    });
    expect(JSON.stringify(list)).not.toContain('uploads/');
    expect(list[0]).not.toHaveProperty('body');
    expect(list[0]).not.toHaveProperty('fileKey');
    expect(list[0]).not.toHaveProperty('imageKey');
  });

  it('returns a published article with the file name', async () => {
    const findUnique = vi.fn().mockResolvedValue(published);
    const result = await service({ article: { findUnique } }).getPublished(
      'a1',
    );

    expect(result).toMatchObject({
      id: 'a1',
      body: '<p>Hello</p>',
      tags: ['advent'],
      fileName: 'notes.pdf',
      hasFile: true,
      hasImage: true,
      series: 'Emmanuel',
      videoLink: 'https://youtube.com/live/tn-dec28',
      audioLink: 'https://open.spotify.com/episode/tn',
    });
    expect(result).not.toHaveProperty('fileKey');
    expect(result).not.toHaveProperty('imageKey');
  });

  it('hides drafts and missing articles', async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({ ...published, articleStatus: 'draft' })
      .mockResolvedValueOnce(null);

    const articles = service({ article: { findUnique } });
    await expect(articles.getPublished('a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(articles.getPublished('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('signs a download only for a published article with a file', async () => {
    const download = vi.fn().mockResolvedValue({
      url: 'https://files.example/notes.pdf',
      expiresAt: 'soon',
    });
    const findUnique = vi.fn().mockResolvedValue(published);
    const result = await service(
      { article: { findUnique } },
      { download },
    ).publishedFile('a1');

    expect(download).toHaveBeenCalledWith('uploads/id/notes.pdf');
    expect(result).toEqual({
      url: 'https://files.example/notes.pdf',
      expiresAt: 'soon',
    });
  });

  it('does not sign a file for an unpublished article or one without a file', async () => {
    const download = vi.fn();
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        ...published,
        articleStatus: 'unpublish',
      })
      .mockResolvedValueOnce({ ...published, fileKey: null });

    const articles = service({ article: { findUnique } }, { download });
    await expect(articles.publishedFile('a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(articles.publishedFile('a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(download).not.toHaveBeenCalled();
  });

  it('signs a cover only for a published article with an image', async () => {
    const view = vi.fn().mockResolvedValue({
      url: 'https://files.example/cover.jpg',
      expiresAt: 'soon',
    });
    const findUnique = vi.fn().mockResolvedValue(published);
    const result = await service(
      { article: { findUnique } },
      { view },
    ).publishedCover('a1');

    expect(view).toHaveBeenCalledWith('uploads/cover.jpg');
    expect(result).toEqual({
      url: 'https://files.example/cover.jpg',
      expiresAt: 'soon',
    });
  });

  it('does not sign a cover for an unpublished article or one without an image', async () => {
    const view = vi.fn();
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        ...published,
        articleStatus: 'unpublish',
      })
      .mockResolvedValueOnce({ ...published, imageKey: null });

    const articles = service({ article: { findUnique } }, { view });
    await expect(articles.publishedCover('a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(articles.publishedCover('a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(view).not.toHaveBeenCalled();
  });

  it('rejects an article whose series does not exist', async () => {
    const create = vi.fn();
    const findUnique = vi.fn().mockResolvedValue(null);
    await expect(
      service({
        article: { create },
        series: { findUnique },
      }).create({
        title: 'Sunday',
        type: 'sermon',
        sermonDate: '2026-01-04',
        seriesId: 'missing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });
});
