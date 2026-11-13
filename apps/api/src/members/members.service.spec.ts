import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from './members.service.js';

function service(prisma: object) {
  return new MembersService(prisma as never);
}

function withTransaction<T extends object>(prisma: T) {
  return {
    ...prisma,
    $transaction: (callback: (tx: T) => Promise<unknown>) => callback(prisma),
  };
}

const approvedRow = {
  id: 'm1',
  birthdate: new Date('1994-06-12T00:00:00.000Z'),
  createdAt: new Date('2026-11-11T00:00:00.000Z'),
  status: 'approved' as const,
};

const body = {
  firstName: 'Mara',
  lastName: 'Santos',
  mobileNumber: '09171234567',
  birthdate: '1994-06-12',
  gender: 'female',
  civilStatus: 'married',
  branchId: 'b1',
};

describe('MembersService', () => {
  it('creates a pending member with the Member role', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 'm1',
      membershipId: null,
      status: 'pending',
    });
    const result = await service({
      churchBranch: { findUnique: vi.fn().mockResolvedValue({ id: 'b1' }) },
      role: { findUnique: vi.fn().mockResolvedValue({ id: 'r1' }) },
      member: { findFirst: vi.fn().mockResolvedValue(null), create },
    }).create({ ...body, status: 'approved', roles: ['admin'] });

    expect(create).toHaveBeenCalledTimes(1);
    const { data } = create.mock.calls[0][0];
    expect(data.status).toBe('pending');
    expect(data.membershipId).toBeUndefined();
    expect(data.roles).toEqual({ connect: { id: 'r1' } });
    expect(data.dgroupMeetings).toBeUndefined();
    expect(result).toEqual({
      id: 'm1',
      membershipId: null,
      status: 'pending',
    });
  });

  it('creates the leader meetings with the member', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'm1' });
    await service({
      churchBranch: { findUnique: vi.fn().mockResolvedValue({ id: 'b1' }) },
      role: { findUnique: vi.fn().mockResolvedValue(null) },
      member: { findFirst: vi.fn().mockResolvedValue(null), create },
    }).create({
      ...body,
      isDgroupLeader: true,
      dgroupMeetings: [{ name: 'Youth', days: ['friday'], time: '19:00' }],
    });

    const { data } = create.mock.calls[0][0];
    expect(data.roles).toBeUndefined();
    expect(data.dgroupMeetings).toEqual({
      create: [
        { name: 'Youth', description: '', days: ['friday'], time: '19:00' },
      ],
    });
  });

  it('rejects a registration when the first and last name already exist', async () => {
    const create = vi.fn();
    const findFirst = vi.fn().mockResolvedValue({ id: 'existing' });
    await expect(
      service({
        churchBranch: { findUnique: vi.fn().mockResolvedValue({ id: 'b1' }) },
        role: { findUnique: vi.fn().mockResolvedValue({ id: 'r1' }) },
        member: { findFirst, create },
      }).create({ ...body, firstName: ' mara ', lastName: ' santos ' }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        firstName: { equals: 'mara', mode: 'insensitive' },
        lastName: { equals: 'santos', mode: 'insensitive' },
      },
      select: { id: true },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an unknown branch without creating a member', async () => {
    const create = vi.fn();
    await expect(
      service({
        churchBranch: { findUnique: vi.fn().mockResolvedValue(null) },
        member: { create },
      }).create(body),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('assigns a membership id when approving a member who has none', async () => {
    const update = vi.fn().mockResolvedValue({
      ...approvedRow,
      membershipId: 'TNC-00002-26',
    });
    const queryRaw = vi.fn().mockResolvedValue([
      { membershipId: 'TNC-00002-26' },
    ]);
    const prisma = {
      member: {
        findUnique: vi.fn().mockResolvedValue({ membershipId: null }),
        update,
      },
      $queryRaw: queryRaw,
    };
    const member = await service(withTransaction(prisma)).approve('m1');

    expect(queryRaw).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'm1' },
        data: { status: 'approved', membershipId: 'TNC-00002-26' },
      }),
    );
    expect(member.status).toBe('approved');
    expect(member.membershipId).toBe('TNC-00002-26');
    expect(member.birthdate).toBe('1994-06-12');
  });

  it('approves a member without replacing an existing membership id', async () => {
    const update = vi.fn().mockResolvedValue({
      ...approvedRow,
      membershipId: 'TNC-00001-26',
    });
    const queryRaw = vi.fn();
    const prisma = {
      member: {
        findUnique: vi.fn().mockResolvedValue({ membershipId: 'TNC-00001-26' }),
        update,
      },
      $queryRaw: queryRaw,
    };
    const member = await service(withTransaction(prisma)).approve('m1');

    expect(queryRaw).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'm1' },
        data: { status: 'approved' },
      }),
    );
    expect(member.membershipId).toBe('TNC-00001-26');
  });

  it('deletes a rejected member', async () => {
    const deleteMember = vi.fn().mockResolvedValue({});
    const result = await service({
      member: { delete: deleteMember },
    }).reject('m1');

    expect(deleteMember).toHaveBeenCalledWith({ where: { id: 'm1' } });
    expect(result).toEqual({ deleted: true });
  });

  it('filters the list by status and search', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await service({ member: { findMany } }).list({
      status: 'pending',
      search: 'mar',
    });

    const { where } = findMany.mock.calls[0][0];
    expect(where.status).toBe('pending');
    expect(where.OR).toHaveLength(5);
  });

  it('returns not found when the member is missing', async () => {
    const missing = { code: 'P2025' };
    const prisma = {
      member: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockRejectedValue(missing),
        delete: vi.fn().mockRejectedValue(missing),
      },
    };
    const members = service(withTransaction(prisma));

    await expect(members.get('x')).rejects.toBeInstanceOf(NotFoundException);
    await expect(members.approve('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(members.reject('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(members.remove('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
