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
      imageKey: null,
      fileKey: 'files/notes.pdf',
    });
  });

  it('rejects an unknown type', () => {
    expect(() =>
      parseArticleContent({ title: 'Rooted', type: 'notes' }),
    ).toThrow(BadRequestException);
  });
});
