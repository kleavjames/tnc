import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { username?: unknown; password?: unknown } | undefined) {
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    return this.auth.login(username, password);
  }

  @Get('session')
  @UseGuards(AuthGuard)
  session(@Req() request: AuthedRequest) {
    const session = request.session;
    if (!session) {
      throw new UnauthorizedException();
    }
    return {
      user: session.user,
      expiresAt: session.expiresAt.toISOString(),
    };
  }
}
