import { BadRequestException } from '@nestjs/common';

const GENDERS = ['male', 'female'] as const;
const CIVIL_STATUSES = ['single', 'married', 'widowed', 'separated'] as const;
const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

type Gender = (typeof GENDERS)[number];
type CivilStatus = (typeof CIVIL_STATUSES)[number];
type Weekday = (typeof WEEKDAYS)[number];

export type MemberProfile = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string | null;
  messengerName: string | null;
  birthdate: Date;
  gender: Gender;
  civilStatus: CivilStatus;
  branchId: string;
  isDgroupLeader: boolean;
};

export type MemberUpdate = Partial<
  MemberProfile & {
    preTrueLife: boolean;
    trueLife: boolean;
    baptism: boolean;
    dgroupMeetingId: string | null;
  }
>;

export type MeetingInput = {
  name: string;
  description: string;
  days: Weekday[];
  time: string;
};

export type MemberCreate = MemberProfile & { dgroupMeetings: MeetingInput[] };

const MEMBER_STATUSES = ['pending', 'approved', 'reject'] as const;

type MemberStatus = (typeof MEMBER_STATUSES)[number];

export type MemberFilters = {
  status?: MemberStatus;
  branchId?: string;
  search?: string;
};

export function parseMemberCreate(body: unknown): MemberCreate {
  const record = requireRecord(body);
  const profile: MemberProfile = {
    firstName: requiredText(record.firstName, 'firstName'),
    lastName: requiredText(record.lastName, 'lastName'),
    mobileNumber: requiredText(record.mobileNumber, 'mobileNumber'),
    email: optionalEmail(record.email),
    messengerName: optionalText(record.messengerName),
    birthdate: birthdate(record.birthdate),
    gender: oneOf(record.gender, GENDERS, 'gender'),
    civilStatus: oneOf(record.civilStatus, CIVIL_STATUSES, 'civilStatus'),
    branchId: requiredText(record.branchId, 'branchId'),
    isDgroupLeader: optionalBoolean(record.isDgroupLeader, 'isDgroupLeader'),
  };

  const dgroupMeetings = meetings(record.dgroupMeetings);
  if (dgroupMeetings.length > 0 && !profile.isDgroupLeader) {
    throw new BadRequestException(
      'dgroupMeetings are only allowed for a dgroup leader',
    );
  }

  return { ...profile, dgroupMeetings };
}

/** Only the fields present in the body are returned. */
export function parseMemberUpdate(body: unknown): MemberUpdate {
  const record = requireRecord(body);
  const update: MemberUpdate = {};

  if ('firstName' in record) {
    update.firstName = requiredText(record.firstName, 'firstName');
  }
  if ('lastName' in record) {
    update.lastName = requiredText(record.lastName, 'lastName');
  }
  if ('mobileNumber' in record) {
    update.mobileNumber = requiredText(record.mobileNumber, 'mobileNumber');
  }
  if ('email' in record) {
    update.email = optionalEmail(record.email);
  }
  if ('messengerName' in record) {
    update.messengerName = optionalText(record.messengerName);
  }
  if ('birthdate' in record) {
    update.birthdate = birthdate(record.birthdate);
  }
  if ('gender' in record) {
    update.gender = oneOf(record.gender, GENDERS, 'gender');
  }
  if ('civilStatus' in record) {
    update.civilStatus = oneOf(record.civilStatus, CIVIL_STATUSES, 'civilStatus');
  }
  if ('branchId' in record) {
    update.branchId = requiredText(record.branchId, 'branchId');
  }
  if ('isDgroupLeader' in record) {
    update.isDgroupLeader = optionalBoolean(
      record.isDgroupLeader,
      'isDgroupLeader',
    );
  }
  if ('preTrueLife' in record) {
    update.preTrueLife = requiredBoolean(record.preTrueLife, 'preTrueLife');
  }
  if ('trueLife' in record) {
    update.trueLife = requiredBoolean(record.trueLife, 'trueLife');
  }
  if ('baptism' in record) {
    update.baptism = requiredBoolean(record.baptism, 'baptism');
  }
  if ('dgroupMeetingId' in record) {
    update.dgroupMeetingId = optionalId(record.dgroupMeetingId, 'dgroupMeetingId');
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestException('No member fields to update');
  }
  return update;
}

export function parseMemberFilters(query: {
  status?: unknown;
  branchId?: unknown;
  search?: unknown;
}): MemberFilters {
  const filters: MemberFilters = {};
  if (query.status !== undefined && query.status !== '') {
    filters.status = oneOf(query.status, MEMBER_STATUSES, 'status');
  }
  if (typeof query.branchId === 'string' && query.branchId.trim()) {
    filters.branchId = query.branchId.trim();
  }
  if (typeof query.search === 'string' && query.search.trim()) {
    filters.search = query.search.trim();
  }
  return filters;
}

function requireRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Member body is required');
  }
  return body as Record<string, unknown>;
}

function requiredText(value: unknown, field: string): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    throw new BadRequestException(`${field} is required`);
  }
  return text;
}

function optionalText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const text = value.trim();
  return text ? text : null;
}

function optionalEmail(value: unknown): string | null {
  const email = optionalText(value);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException('email is invalid');
  }
  return email;
}

function optionalBoolean(value: unknown, field: string): boolean {
  if (value === undefined) {
    return false;
  }
  if (typeof value !== 'boolean') {
    throw new BadRequestException(`${field} must be true or false`);
  }
  return value;
}

function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new BadRequestException(`${field} must be true or false`);
  }
  return value;
}

function optionalId(value: unknown, field: string): string | null {
  if (value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} is invalid`);
  }
  return value.trim();
}

function birthdate(value: unknown): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('birthdate is required as YYYY-MM-DD');
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException('birthdate is invalid');
  }
  if (date.getTime() > Date.now()) {
    throw new BadRequestException('birthdate cannot be in the future');
  }
  return date;
}

function meetings(value: unknown): MeetingInput[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new BadRequestException('dgroupMeetings must be a list');
  }
  return value.map((item, index) => meeting(item, index));
}

function meeting(value: unknown, index: number): MeetingInput {
  const label = `dgroupMeetings[${index}]`;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${label} is invalid`);
  }
  const record = value as Record<string, unknown>;

  if (!Array.isArray(record.days) || record.days.length === 0) {
    throw new BadRequestException(`${label}.days needs at least one day`);
  }
  const days = [
    ...new Set(record.days.map((day) => oneOf(day, WEEKDAYS, `${label}.days`))),
  ];

  const time = typeof record.time === 'string' ? record.time.trim() : '';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new BadRequestException(`${label}.time must be HH:MM`);
  }

  return {
    name: requiredText(record.name, `${label}.name`),
    description:
      typeof record.description === 'string' ? record.description.trim() : '',
    days: WEEKDAYS.filter((day) => days.includes(day)),
    time,
  };
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  if (typeof value === 'string' && allowed.includes(value as T)) {
    return value as T;
  }
  throw new BadRequestException(`${field} is invalid`);
}
