import { BadRequestException } from '@nestjs/common';
import { parseContentPatch } from './content.input.js';

describe('parseContentPatch', () => {
  it('accepts empty string to clear the link', () => {
    expect(parseContentPatch({ latestSermon: '  ' })).toEqual({
      latestSermon: '',
    });
  });

  it('accepts a valid https URL', () => {
    expect(
      parseContentPatch({
        latestSermon: ' https://youtube.com/watch?v=abc ',
      }),
    ).toEqual({ latestSermon: 'https://youtube.com/watch?v=abc' });
  });

  it('rejects invalid URLs', () => {
    expect(() =>
      parseContentPatch({ latestSermon: 'not-a-url' }),
    ).toThrow(BadRequestException);
  });
});
