import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SESSION_TTL_MS,
  createSessionToken,
  hashToken,
  verifyPassword,
} from './password.js';

export type AuthUser = {
  id: string;
  username: string;
};

export type AuthSession = {
  user: AuthUser;
  expiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(username: string, password: string): Promise<{
    token: string;
    expiresAt: string;
    user: AuthUser;
  }> {
    const user = username
      ? await this.prisma.user.findUnique({ where: { username } })
      : null;
    const valid =
      user !== null && password.length > 0
        ? await verifyPassword(password, user.passwordHash)
        : false;

    if (!user || !valid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { token, tokenHash } = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.prisma.session.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: { id: user.id, username: user.username },
    };
  }

  async requireSession(token: string): Promise<AuthSession> {
    if (!token) {
      throw new UnauthorizedException();
    }

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException();
    }

    return {
      user: { id: session.user.id, username: session.user.username },
      expiresAt: session.expiresAt,
    };
  }
}
