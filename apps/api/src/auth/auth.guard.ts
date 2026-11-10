import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService, type AuthSession } from './auth.service.js';

export type AuthedRequest = {
  headers: { authorization?: string | string[] };
  session?: AuthSession;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    request.session = await this.auth.requireSession(
      bearerToken(request.headers.authorization),
    );
    return true;
  }
}

export function bearerToken(header: string | string[] | undefined): string {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith('Bearer ')) {
    return '';
  }
  return value.slice('Bearer '.length).trim();
}
