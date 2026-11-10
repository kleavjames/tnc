import { AuthService } from './auth.service.js';
import { hashToken } from './password.js';

describe('AuthService.logout', () => {
  it('deletes the session for the token hash', async () => {
    const token = 'opaque-session-token';
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const auth = new AuthService({ session: { deleteMany } } as never);

    await expect(auth.logout(token)).resolves.toEqual({ loggedOut: true });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(token) },
    });
  });

  it('is idempotent when no token is provided', async () => {
    const deleteMany = vi.fn();
    const auth = new AuthService({ session: { deleteMany } } as never);

    await expect(auth.logout('')).resolves.toEqual({ loggedOut: true });
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
