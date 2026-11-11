import { BadRequestException } from '@nestjs/common';
import { parseAttended } from './glc.input.js';

describe('parseAttended', () => {
  it('reads a boolean attended flag', () => {
    expect(parseAttended({ attended: true })).toBe(true);
    expect(parseAttended({ attended: false })).toBe(false);
  });

  it('rejects a missing or non-boolean flag', () => {
    expect(() => parseAttended(null)).toThrow(BadRequestException);
    expect(() => parseAttended({})).toThrow(BadRequestException);
    expect(() => parseAttended({ attended: 'yes' })).toThrow(
      BadRequestException,
    );
  });
});
