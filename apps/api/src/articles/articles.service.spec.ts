import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service.js';

const english = {
  language: 'english' as const,
  title: 'Room for Him',
  subtitle: 'Advent',
  body: '<p>Hello</p>',
  verse: 'Luke 2:1-7',
  articleStatus: 'published' as const,
  fileKey: 'uploads/id/notes.pdf',
};

const published = {
  id: 'a1',
  tags: ['advent'],
  type: 'sermon' as const,
  uploadedAt: new Date('2025-12-14T00:00:00.000Z'),
  sermonDate: new Date('2025-12-07T00:00:00.000Z'),
  imageKey: 'uploads/cover.jpg',
  videoLink: 'https://youtube.com/live/tn-dec28',
  audioLink: 'https://open.spotify.com/episode/tn',
  series: { title: 'Emmanuel' },
  locales: [english],
};

const articleInput = {
  title: 'Sunday',
  type: 'sermon',
  sermonDate: '2026-01-04',
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
        type: 'sermon',
        uploadedAt: new Date('2025-12-14T00:00:00.000Z'),
        imageKey: 'uploads/cover.jpg',
        series: { title: 'Emmanuel' },
        locales: [
          {
            language: 'tagalog',
            title: 'Silid',
            subtitle: '',
            verse: 'Lucas 2',
            articleStatus: 'draft',
          },
          {
            language: 'english',
            title: 'Room for Him',
            subtitle: 'Advent',
            verse: 'Luke 2:1-7',
            articleStatus: 'draft',
          },
        ],
      },
      {
        id: 'a2',
        type: 'glc',
        uploadedAt: new Date('2025-12-15T00:00:00.000Z'),
        imageKey: null,
        series: null,
        locales: [
          {
            language: 'english',
            title: 'Notes',
            subtitle: '',
            verse: 'John 1',
            articleStatus: 'published',
          },
        ],
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
        title: 'Room for Him',
        articleStatus: 'draft',
        imageKey: 'uploads/cover.jpg',
        series: 'Emmanuel',
        locales: [
          { language: 'english', articleStatus: 'draft' },
          { language: 'tagalog', articleStatus: 'draft' },
        ],
      }),
      expect.objectContaining({
        id: 'a2',
        imageKey: null,
        series: null,
        locales: [{ language: 'english', articleStatus: 'published' }],
      }),
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
        imageKey: null,
        series: null,
        locales: [{ ...english, fileKey: null }],
      },
    ]);
    const list = await service({ article: { findMany } }).listPublished();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          locales: { some: { articleStatus: 'published' } },
        },
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
      locales: [
        {
          language: 'english',
          title: 'Room for Him',
          subtitle: 'Advent',
          verse: 'Luke 2:1-7',
          hasFile: true,
        },
      ],
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
      locales: [
        {
          language: 'english',
          title: 'Room for Him',
          body: '<p>Hello</p>',
          fileName: 'notes.pdf',
          hasFile: true,
        },
      ],
    });
    expect(result).not.toHaveProperty('fileKey');
    expect(result).not.toHaveProperty('imageKey');
  });

  it('hides drafts and missing articles', async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        ...published,
        locales: [{ ...english, articleStatus: 'draft' }],
      })
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

  it('signs the file for the requested published language', async () => {
    const download = vi.fn().mockResolvedValue({
      url: 'https://files.example/tl.pdf',
      expiresAt: 'soon',
    });
    const findUnique = vi.fn().mockResolvedValue({
      locales: [
        english,
        {
          ...english,
          language: 'tagalog',
          fileKey: 'uploads/id/tl.pdf',
        },
      ],
    });
    const result = await service(
      { article: { findUnique } },
      { download },
    ).publishedFile('a1', 'tagalog');

    expect(download).toHaveBeenCalledWith('uploads/id/tl.pdf');
    expect(result).toEqual({
      url: 'https://files.example/tl.pdf',
      expiresAt: 'soon',
    });
  });

  it('does not sign a file for an unpublished article or one without a file', async () => {
    const download = vi.fn();
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        ...published,
        locales: [{ ...english, articleStatus: 'unpublish' }],
      })
      .mockResolvedValueOnce({
        ...published,
        locales: [{ ...english, fileKey: null }],
      });

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
        locales: [{ ...english, articleStatus: 'unpublish' }],
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
        ...articleInput,
        seriesId: 'missing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates the english locale and rejects another language', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 'a1',
      locales: [{ articleStatus: 'draft' }],
    });
    const articles = service({ article: { create } });

    await expect(articles.create(articleInput)).resolves.toEqual({
      id: 'a1',
      articleStatus: 'draft',
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          locales: {
            create: expect.objectContaining({
              language: 'english',
              title: 'Sunday',
              articleStatus: 'draft',
            }),
          },
        }),
      }),
    );

    await expect(
      articles.create({ ...articleInput, language: 'tagalog' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a tagalog locale on a later save and keeps a new locale as draft', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'a1' });
    const findUnique = vi.fn().mockResolvedValue(null);
    const upsert = vi.fn().mockResolvedValue({ articleStatus: 'draft' });
    const $transaction = vi.fn(async (run: (tx: unknown) => unknown) =>
      run({
        article: { update },
        articleLocale: { findUnique, upsert },
      }),
    );

    const result = await service({
      $transaction,
      series: { findUnique: vi.fn().mockResolvedValue({ id: 'series-1' }) },
    }).update('a1', {
      ...articleInput,
      language: 'tagalog',
      title: 'Linggo',
      fileKey: 'files/tl.pdf',
      seriesId: 'series-1',
    });

    expect(result).toEqual({ id: 'a1', articleStatus: 'draft' });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'a1' },
        data: expect.objectContaining({ seriesId: 'series-1' }),
      }),
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          articleId_language: { articleId: 'a1', language: 'tagalog' },
        },
        create: expect.objectContaining({
          language: 'tagalog',
          title: 'Linggo',
          fileKey: 'files/tl.pdf',
          articleStatus: 'draft',
        }),
      }),
    );
  });
});
