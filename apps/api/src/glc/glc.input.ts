import { BadRequestException } from '@nestjs/common';

export function parseAttended(body: unknown): boolean {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Attendance body is required');
  }
  const attended = (body as { attended?: unknown }).attended;
  if (typeof attended !== 'boolean') {
    throw new BadRequestException('attended must be true or false');
  }
  return attended;
}
