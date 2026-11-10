import { createSessionToken, hashPassword, hashToken, verifyPassword } from './password.js';

describe('password', () => {
  it('accepts the original password and rejects a different one', async () => {
    const stored = await hashPassword('Ephphatha');

    await expect(verifyPassword('Ephphatha', stored)).resolves.toBe(true);
    await expect(verifyPassword('wrong', stored)).resolves.toBe(false);
    await expect(verifyPassword('Ephphatha', 'not-a-hash')).resolves.toBe(false);
  });
});

describe('session token', () => {
  it('hashes the raw token the same way on later requests', () => {
    const { token, tokenHash } = createSessionToken();

    expect(token.length).toBeGreaterThan(20);
    expect(hashToken(token)).toBe(tokenHash);
    expect(hashToken(`${token}x`)).not.toBe(tokenHash);
  });
});
