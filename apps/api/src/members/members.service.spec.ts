import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service.js';

function service(prisma: object) {
  return new MembersService(prisma as never);
}

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
  it('creates an unapproved member with the Member role', async () => {
    const create = vi
      .fn()
      .mockResolvedValue({ id: 'm1', membershipId: 'TNC-00001-26', approved: false });
    const result = await service({
      churchBranch: { findUnique: vi.fn().mockResolvedValue({ id: 'b1' }) },
      role: { findUnique: vi.fn().mockResolvedValue({ id: 'r1' }) },
      member: { create },
    }).create({ ...body, approved: true, roles: ['admin'] });

    expect(create).toHaveBeenCalledTimes(1);
    const { data } = create.mock.calls[0][0];
    expect(data.approved).toBe(false);
    expect(data.roles).toEqual({ connect: { id: 'r1' } });
    expect(data.dgroupMeetings).toBeUndefined();
    expect(result).toEqual({
      id: 'm1',
      membershipId: 'TNC-00001-26',
      approved: false,
    });
  });

  it('creates the leader meetings with the member', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'm1' });
    await service({
      churchBranch: { findUnique: vi.fn().mockResolvedValue({ id: 'b1' }) },
      role: { findUnique: vi.fn().mockResolvedValue(null) },
      member: { create },
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

  it('approves a member', async () => {
    const update = vi.fn().mockResolvedValue({
      id: 'm1',
      birthdate: new Date('1994-06-12T00:00:00.000Z'),
      createdAt: new Date('2026-11-11T00:00:00.000Z'),
      approved: true,
    });
    const member = await service({ member: { update } }).approve('m1');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'm1' },
        data: { approved: true },
      }),
    );
    expect(member.approved).toBe(true);
    expect(member.birthdate).toBe('1994-06-12');
  });

  it('filters the list by approval and search', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await service({ member: { findMany } }).list({
      approved: 'false',
      search: 'mar',
    });

    const { where } = findMany.mock.calls[0][0];
    expect(where.approved).toBe(false);
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
    const members = service(prisma);

    await expect(members.get('x')).rejects.toBeInstanceOf(NotFoundException);
    await expect(members.approve('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(members.remove('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
