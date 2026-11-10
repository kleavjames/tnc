import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  parseMemberCreate,
  parseMemberFilters,
  parseMemberUpdate,
} from './member.input.js';

const DEFAULT_ROLE = 'Member';

const memberSelect = {
  id: true,
  membershipId: true,
  firstName: true,
  lastName: true,
  mobileNumber: true,
  email: true,
  messengerName: true,
  birthdate: true,
  gender: true,
  civilStatus: true,
  isDgroupLeader: true,
  approved: true,
  createdAt: true,
  branch: { select: { id: true, name: true, branch: true } },
  roles: { select: { id: true, name: true } },
  dgroupMeetings: {
    select: { id: true, name: true, description: true, days: true, time: true },
    orderBy: { createdAt: 'asc' },
  },
} as const satisfies Prisma.MemberSelect;

type MemberRow = Prisma.MemberGetPayload<{ select: typeof memberSelect }>;

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { approved?: unknown; branchId?: unknown; search?: unknown }) {
    const filters = parseMemberFilters(query);
    const where: Prisma.MemberWhereInput = {};
    if (filters.approved !== undefined) {
      where.approved = filters.approved;
    }
    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.search) {
      const contains = { contains: filters.search, mode: 'insensitive' } as const;
      where.OR = [
        { firstName: contains },
        { lastName: contains },
        { email: contains },
        { mobileNumber: contains },
        { membershipId: contains },
      ];
    }

    const members = await this.prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: memberSelect,
    });
    return members.map(toMember);
  }

  async get(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      select: memberSelect,
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return toMember(member);
  }

  /** Public registration. New members are always unapproved. */
  async create(body: unknown) {
    const { dgroupMeetings, ...profile } = parseMemberCreate(body);
    await this.requireBranch(profile.branchId);

    const role = await this.prisma.role.findUnique({
      where: { name: DEFAULT_ROLE },
      select: { id: true },
    });

    const member = await this.prisma.member.create({
      data: {
        ...profile,
        approved: false,
        roles: role ? { connect: { id: role.id } } : undefined,
        dgroupMeetings:
          dgroupMeetings.length > 0 ? { create: dgroupMeetings } : undefined,
      },
      select: { id: true, membershipId: true, approved: true },
    });
    return member;
  }

  async update(id: string, body: unknown) {
    const data = parseMemberUpdate(body);
    if (data.branchId) {
      await this.requireBranch(data.branchId);
    }
    try {
      const member = await this.prisma.member.update({
        where: { id },
        data,
        select: memberSelect,
      });
      return toMember(member);
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
  }

  approve(id: string) {
    return this.setApproved(id, true);
  }

  unapprove(id: string) {
    return this.setApproved(id, false);
  }

  async remove(id: string) {
    try {
      await this.prisma.member.delete({ where: { id } });
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
    return { deleted: true as const };
  }

  private async setApproved(id: string, approved: boolean) {
    try {
      const member = await this.prisma.member.update({
        where: { id },
        data: { approved },
        select: memberSelect,
      });
      return toMember(member);
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
  }

  private async requireBranch(branchId: string) {
    const branch = await this.prisma.churchBranch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });
    if (!branch) {
      throw new BadRequestException('branchId is invalid');
    }
  }
}

function toMember(member: MemberRow) {
  return {
    ...member,
    birthdate: member.birthdate.toISOString().slice(0, 10),
    createdAt: member.createdAt.toISOString(),
  };
}

function mapMissing(error: unknown, message: string): unknown {
  return prismaCode(error) === 'P2025' ? new NotFoundException(message) : error;
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
