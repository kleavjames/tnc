import { BadRequestException } from '@nestjs/common';
import { parseSeriesTitle } from './series.input.js';

describe('parseSeriesTitle', () => {
  it('trims a title', () => {
    expect(parseSeriesTitle({ title: '  Emmanuel  ' })).toBe('Emmanuel');
  });

  it('rejects a blank title', () => {
    expect(() => parseSeriesTitle({ title: '   ' })).toThrow(
      BadRequestException,
    );
    expect(() => parseSeriesTitle({})).toThrow(BadRequestException);
  });
});
