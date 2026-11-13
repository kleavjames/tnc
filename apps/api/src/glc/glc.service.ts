import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseAttended } from './glc.input.js';

const curriculumSelect = {
  id: true,
  level: true,
  name: true,
  title: true,
  books: {
    orderBy: { number: 'asc' as const },
    select: {
      id: true,
      number: true,
      title: true,
      sessions: {
        orderBy: { number: 'asc' as const },
        select: { id: true, number: true, title: true },
      },
    },
  },
};

type CurriculumLevel = {
  id: string;
  level: number;
  name: string;
  title: string;
  books: {
    id: string;
    number: number;
    title: string;
    sessions: { id: string; number: number; title: string }[];
  }[];
};

type ProgressRow = {
  id: string;
  memberId: string;
  sessions: { sessionId: string; attended: boolean }[];
};

export type GlcAttendanceMember = {
  id: string;
  firstName: string;
  lastName: string;
  branch: { id: string; name: string; branch: string };
  attendedSessionIds: string[];
};

export type GlcAttendanceView = {
  levels: CurriculumLevel[];
  members: GlcAttendanceMember[];
};

export type GlcProgressView = {
  id: string;
  memberId: string;
  attendedCount: number;
  sessionCount: number;
  levels: {
    id: string;
    level: number;
    name: string;
    title: string;
    books: {
      id: string;
      number: number;
      title: string;
      sessions: {
        id: string;
        number: number;
        title: string;
        attended: boolean;
      }[];
    }[];
  }[];
};

@Injectable()
export class GlcService {
  constructor(private readonly prisma: PrismaService) {}

  async listAttendance(): Promise<GlcAttendanceView> {
    const [levels, rows] = await Promise.all([
      this.prisma.glc.findMany({
        orderBy: { level: 'asc' },
        select: curriculumSelect,
      }) as Promise<CurriculumLevel[]>,
      this.prisma.glcProgress.findMany({
        select: {
          sessions: { select: { sessionId: true, attended: true } },
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              branch: { select: { id: true, name: true, branch: true } },
            },
          },
        },
        orderBy: [
          { member: { lastName: 'asc' } },
          { member: { firstName: 'asc' } },
        ],
      }),
    ]);

    return {
      levels,
      members: rows.map((row) => ({
        id: row.member.id,
        firstName: row.member.firstName,
        lastName: row.member.lastName,
        branch: row.member.branch,
        attendedSessionIds: row.sessions
          .filter((session) => session.attended)
          .map((session) => session.sessionId),
      })),
    };
  }

  async getProgress(memberId: string): Promise<GlcProgressView> {
    const progress = await this.findProgress(memberId);
    if (!progress) {
      throw new NotFoundException('GLC has not been started');
    }
    return this.toView(progress);
  }

  async start(memberId: string): Promise<GlcProgressView> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const existing = await this.findProgress(memberId);
    if (existing) {
      return this.toView(existing);
    }

    const sessionIds = await this.sessionIds();
    try {
      await this.prisma.glcProgress.create({
        data: {
          memberId,
          sessions: {
            create: sessionIds.map((sessionId) => ({ sessionId })),
          },
        },
      });
    } catch (error) {
      if (prismaCode(error) !== 'P2002') {
        throw error;
      }
    }

    const progress = await this.findProgress(memberId);
    if (!progress) {
      throw new NotFoundException('GLC has not been started');
    }
    return this.toView(progress);
  }

  async setAttended(
    memberId: string,
    sessionId: string,
    body: unknown,
  ): Promise<GlcProgressView> {
    const attended = parseAttended(body);
    const progress = await this.prisma.glcProgress.findUnique({
      where: { memberId },
      select: { id: true },
    });
    if (!progress) {
      throw new BadRequestException('GLC has not been started');
    }
    const session = await this.prisma.glcSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!session) {
      throw new BadRequestException('sessionId is invalid');
    }

    await this.prisma.glcProgressSession.upsert({
      where: {
        progressId_sessionId: { progressId: progress.id, sessionId },
      },
      create: { progressId: progress.id, sessionId, attended },
      update: { attended },
    });
    return this.getProgress(memberId);
  }

  async remove(memberId: string): Promise<{ deleted: true }> {
    try {
      await this.prisma.glcProgress.delete({ where: { memberId } });
    } catch (error) {
      if (prismaCode(error) === 'P2025') {
        throw new NotFoundException('GLC has not been started');
      }
      throw error;
    }
    return { deleted: true };
  }

  private async findProgress(memberId: string): Promise<ProgressRow | null> {
    return this.prisma.glcProgress.findUnique({
      where: { memberId },
      select: {
        id: true,
        memberId: true,
        sessions: { select: { sessionId: true, attended: true } },
      },
    });
  }

  private async sessionIds(): Promise<string[]> {
    const sessions = await this.prisma.glcSession.findMany({
      select: { id: true },
    });
    return sessions.map((session) => session.id);
  }

  private async toView(progress: ProgressRow): Promise<GlcProgressView> {
    const levels = (await this.prisma.glc.findMany({
      orderBy: { level: 'asc' },
      select: curriculumSelect,
    })) as CurriculumLevel[];
    const attended = new Map(
      progress.sessions.map((session) => [session.sessionId, session.attended]),
    );
    let attendedCount = 0;
    let sessionCount = 0;
    const viewLevels = levels.map((level) => ({
      id: level.id,
      level: level.level,
      name: level.name,
      title: level.title,
      books: level.books.map((book) => ({
        id: book.id,
        number: book.number,
        title: book.title,
        sessions: book.sessions.map((session) => {
          sessionCount += 1;
          const didAttend = attended.get(session.id) === true;
          if (didAttend) {
            attendedCount += 1;
          }
          return {
            id: session.id,
            number: session.number,
            title: session.title,
            attended: didAttend,
          };
        }),
      })),
    }));

    return {
      id: progress.id,
      memberId: progress.memberId,
      attendedCount,
      sessionCount,
      levels: viewLevels,
    };
  }
}

function prismaCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return null;
}
