import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GlcService } from './glc.service.js';

function service(prisma: object) {
  return new GlcService(prisma as never);
}

const curriculum = [
  {
    id: 'g1',
    level: 1,
    name: 'GLC 1',
    title: 'Edify',
    books: [
      {
        id: 'b1',
        number: 1,
        title: 'One by One',
        sessions: [
          { id: 's1', number: 1, title: 'One Truth' },
          { id: 's2', number: 2, title: 'One Way' },
        ],
      },
    ],
  },
];

function progressRow(attended: { sessionId: string; attended: boolean }[]) {
  return {
    id: 'p1',
    memberId: 'm1',
    sessions: attended,
  };
}

describe('GlcService', () => {
  it('starts GLC by creating one attendance row per session', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'p1' });
    const findProgress = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(progressRow([]));
    const result = await service({
      member: { findUnique: vi.fn().mockResolvedValue({ id: 'm1' }) },
      glcProgress: { findUnique: findProgress, create },
      glcSession: {
        findMany: vi.fn().mockResolvedValue([{ id: 's1' }, { id: 's2' }]),
      },
      glc: { findMany: vi.fn().mockResolvedValue(curriculum) },
    }).start('m1');

    expect(create).toHaveBeenCalledWith({
      data: {
        memberId: 'm1',
        sessions: { create: [{ sessionId: 's1' }, { sessionId: 's2' }] },
      },
    });
    expect(result.sessionCount).toBe(2);
    expect(result.attendedCount).toBe(0);
    expect(result.levels[0]?.books[0]?.sessions[0]?.attended).toBe(false);
  });

  it('returns existing progress without creating another', async () => {
    const create = vi.fn();
    const result = await service({
      member: { findUnique: vi.fn().mockResolvedValue({ id: 'm1' }) },
      glcProgress: {
        findUnique: vi.fn().mockResolvedValue(
          progressRow([{ sessionId: 's1', attended: true }]),
        ),
      },
      glc: { findMany: vi.fn().mockResolvedValue(curriculum) },
    }).start('m1');

    expect(create).not.toHaveBeenCalled();
    expect(result.attendedCount).toBe(1);
    expect(result.levels[0]?.name).toBe('GLC 1');
  });

  it('rejects a start for a missing member', async () => {
    const create = vi.fn();
    await expect(
      service({
        member: { findUnique: vi.fn().mockResolvedValue(null) },
        glcProgress: { create },
      }).start('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 404 when GLC has not been started', async () => {
    await expect(
      service({
        glcProgress: { findUnique: vi.fn().mockResolvedValue(null) },
      }).getProgress('m1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('marks a session attended', async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const result = await service({
      glcProgress: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ id: 'p1' })
          .mockResolvedValueOnce(
            progressRow([{ sessionId: 's1', attended: true }]),
          ),
      },
      glcSession: { findUnique: vi.fn().mockResolvedValue({ id: 's1' }) },
      glcProgressSession: { upsert },
      glc: { findMany: vi.fn().mockResolvedValue(curriculum) },
    }).setAttended('m1', 's1', { attended: true });

    expect(upsert).toHaveBeenCalledWith({
      where: { progressId_sessionId: { progressId: 'p1', sessionId: 's1' } },
      create: { progressId: 'p1', sessionId: 's1', attended: true },
      update: { attended: true },
    });
    expect(result.attendedCount).toBe(1);
  });

  it('rejects attendance before GLC is started', async () => {
    await expect(
      service({
        glcProgress: { findUnique: vi.fn().mockResolvedValue(null) },
      }).setAttended('m1', 's1', { attended: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unknown session', async () => {
    const upsert = vi.fn();
    await expect(
      service({
        glcProgress: { findUnique: vi.fn().mockResolvedValue({ id: 'p1' }) },
        glcSession: { findUnique: vi.fn().mockResolvedValue(null) },
        glcProgressSession: { upsert },
      }).setAttended('m1', 'missing', { attended: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('deletes progress', async () => {
    const remove = vi.fn().mockResolvedValue({});
    await expect(
      service({ glcProgress: { delete: remove } }).remove('m1'),
    ).resolves.toEqual({ deleted: true });
    expect(remove).toHaveBeenCalledWith({ where: { memberId: 'm1' } });
  });

  it('returns 404 when deleting progress that does not exist', async () => {
    await expect(
      service({
        glcProgress: {
          delete: vi.fn().mockRejectedValue({ code: 'P2025' }),
        },
      }).remove('m1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists curriculum and members who started GLC', async () => {
    const findManyProgress = vi.fn().mockResolvedValue([
      {
        sessions: [
          { sessionId: 's1', attended: true },
          { sessionId: 's2', attended: false },
        ],
        member: {
          id: 'm1',
          firstName: 'Bea',
          lastName: 'Ramos',
          branch: { id: 'br1', name: 'TNC', branch: 'Northgate' },
        },
      },
    ]);
    const result = await service({
      glcProgress: { findMany: findManyProgress },
      glc: { findMany: vi.fn().mockResolvedValue(curriculum) },
    }).listAttendance();

    expect(findManyProgress).toHaveBeenCalledWith({
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
    });
    expect(result.levels).toEqual(curriculum);
    expect(result.members).toEqual([
      {
        id: 'm1',
        firstName: 'Bea',
        lastName: 'Ramos',
        branch: { id: 'br1', name: 'TNC', branch: 'Northgate' },
        attendedSessionIds: ['s1'],
      },
    ]);
  });
});
