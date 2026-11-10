import { bearerToken } from './auth.guard.js';

describe('bearerToken', () => {
  it('reads a bearer token and ignores other schemes', () => {
    expect(bearerToken('Bearer abc.def')).toBe('abc.def');
    expect(bearerToken('Basic abc')).toBe('');
    expect(bearerToken(undefined)).toBe('');
    expect(bearerToken(['Bearer from-array'])).toBe('from-array');
  });
});
