import { BadRequestException } from '@nestjs/common';
import { parseArticleContent } from './article.input.js';

describe('parseArticleContent', () => {
  it('requires a title and keeps the editor fields', () => {
    expect(() => parseArticleContent({ title: '  ' })).toThrow(BadRequestException);

    expect(
      parseArticleContent({
        title: '  The God Who Stays  ',
        subtitle: 'A line',
        body: '<p>Hello</p>',
        verse: 'Matthew 28:20',
        tags: ['hope', 1],
        type: 'sermon',
        sermonDate: '2026-01-04',
        articleStatus: 'published',
        imageKey: '',
        fileKey: 'files/notes.pdf',
      }),
    ).toEqual({
      title: 'The God Who Stays',
      subtitle: 'A line',
      body: '<p>Hello</p>',
      verse: 'Matthew 28:20',
      tags: ['hope'],
      type: 'sermon',
      sermonDate: new Date('2026-01-04T00:00:00.000Z'),
      imageKey: null,
      fileKey: 'files/notes.pdf',
      videoLink: null,
      audioLink: null,
      seriesId: null,
    });
  });

  it('clears a missing series and keeps a series id', () => {
    expect(
      parseArticleContent({
        title: 'Sunday',
        type: 'sermon',
        sermonDate: '2026-01-04',
        seriesId: ' none ',
      }),
    ).toMatchObject({ seriesId: null });

    expect(
      parseArticleContent({
        title: 'Sunday',
        type: 'sermon',
        sermonDate: '2026-01-04',
        seriesId: ' series-1 ',
      }),
    ).toMatchObject({ seriesId: 'series-1' });
  });

  it('keeps http(s) media links and clears blanks', () => {
    expect(
      parseArticleContent({
        title: 'Sunday',
        type: 'sermon',
        sermonDate: '2026-01-04',
        videoLink: '  https://youtube.com/live/tn-dec28  ',
        audioLink: '',
      }),
    ).toMatchObject({
      videoLink: 'https://youtube.com/live/tn-dec28',
      audioLink: null,
    });

    expect(() =>
      parseArticleContent({
        title: 'Sunday',
        type: 'sermon',
        sermonDate: '2026-01-04',
        videoLink: 'youtube.com/live/tn-dec28',
      }),
    ).toThrow(BadRequestException);
  });

  it('requires a real date for every article type', () => {
    expect(() =>
      parseArticleContent({ title: 'Notes', type: 'glc' }),
    ).toThrow(BadRequestException);
    expect(() =>
      parseArticleContent({
        title: 'Sunday',
        type: 'lnl',
        sermonDate: '2026-02-31',
      }),
    ).toThrow(BadRequestException);

    expect(
      parseArticleContent({
        title: 'Notes',
        type: 'glc',
        sermonDate: '2026-01-04',
      }),
    ).toMatchObject({
      type: 'glc',
      sermonDate: new Date('2026-01-04T00:00:00.000Z'),
    });
  });

  it('rejects an unknown type', () => {
    expect(() =>
      parseArticleContent({ title: 'Rooted', type: 'notes' }),
    ).toThrow(BadRequestException);
  });
});
