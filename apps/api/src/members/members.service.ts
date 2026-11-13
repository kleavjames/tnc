import {
  BadRequestException,
  ConflictException,
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
  preTrueLife: true,
  trueLife: true,
  baptism: true,
  status: true,
  createdAt: true,
  branch: { select: { id: true, name: true, branch: true } },
  roles: { select: { id: true, name: true } },
  dgroupMeeting: {
    select: { id: true, name: true, days: true, time: true },
  },
  dgroupMeetings: {
    select: { id: true, name: true, description: true, days: true, time: true },
    orderBy: { createdAt: 'asc' },
  },
} as const satisfies Prisma.MemberSelect;

type MemberRow = Prisma.MemberGetPayload<{ select: typeof memberSelect }>;

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { status?: unknown; branchId?: unknown; search?: unknown }) {
    const filters = parseMemberFilters(query);
    const where: Prisma.MemberWhereInput = {};
    if (filters.status) {
      where.status = filters.status;
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

  /** Public registration. New members are always pending. */
  async create(body: unknown) {
    const { dgroupMeetings, ...profile } = parseMemberCreate(body);
    await this.requireBranch(profile.branchId);
    await this.requireUniqueName(profile.firstName, profile.lastName);

    const role = await this.prisma.role.findUnique({
      where: { name: DEFAULT_ROLE },
      select: { id: true },
    });

    const member = await this.prisma.member.create({
      data: {
        ...profile,
        status: 'pending',
        roles: role ? { connect: { id: role.id } } : undefined,
        dgroupMeetings:
          dgroupMeetings.length > 0 ? { create: dgroupMeetings } : undefined,
      },
      select: { id: true, membershipId: true, status: true },
    });
    return member;
  }

  async update(id: string, body: unknown) {
    const data = parseMemberUpdate(body);
    if (data.branchId) {
      await this.requireBranch(data.branchId);
    }
    if (data.dgroupMeetingId) {
      await this.requireDgroupMeeting(data.dgroupMeetingId);
    }
    const {
      dgroupMeetingId,
      preTrueLife,
      trueLife,
      baptism,
      ...profile
    } = data;
    const update: Prisma.MemberUpdateInput = { ...profile };
    if (preTrueLife !== undefined) {
      update.preTrueLife = preTrueLife;
    }
    if (trueLife !== undefined) {
      update.trueLife = trueLife;
    }
    if (baptism !== undefined) {
      update.baptism = baptism;
    }
    if (dgroupMeetingId !== undefined) {
      update.dgroupMeeting =
        dgroupMeetingId === null
          ? { disconnect: true }
          : { connect: { id: dgroupMeetingId } };
    }
    try {
      const member = await this.prisma.member.update({
        where: { id },
        data: update,
        select: memberSelect,
      });
      return toMember(member);
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
  }

  async approve(id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const current = await tx.member.findUnique({
          where: { id },
          select: { membershipId: true },
        });
        if (!current) {
          throw new NotFoundException('Member not found');
        }

        const data: Prisma.MemberUpdateInput = { status: 'approved' };
        if (!current.membershipId) {
          const rows = await tx.$queryRaw<Array<{ membershipId: string }>>`
            SELECT tnc_membership_id() AS "membershipId"
          `;
          const membershipId = rows[0]?.membershipId;
          if (!membershipId) {
            throw new Error('Could not assign a membership ID');
          }
          data.membershipId = membershipId;
        }

        const member = await tx.member.update({
          where: { id },
          data,
          select: memberSelect,
        });
        return toMember(member);
      });
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
  }

  async reject(id: string) {
    try {
      await this.prisma.member.delete({ where: { id } });
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
    return { deleted: true as const };
  }

  async remove(id: string) {
    try {
      await this.prisma.member.delete({ where: { id } });
    } catch (error) {
      throw mapMissing(error, 'Member not found');
    }
    return { deleted: true as const };
  }

  private async requireUniqueName(firstName: string, lastName: string) {
    const existing = await this.prisma.member.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'This information is already added. Please register a different member.',
      );
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

  private async requireDgroupMeeting(id: string) {
    const meeting = await this.prisma.dgroupMeeting.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!meeting) {
      throw new BadRequestException('dgroupMeetingId is invalid');
    }
  }

  listDgroupMeetings() {
    return this.prisma.dgroupMeeting.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, days: true, time: true },
    });
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
