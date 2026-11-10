import { BadRequestException } from '@nestjs/common';
import {
  parseMemberCreate,
  parseMemberFilters,
  parseMemberUpdate,
} from './member.input.js';

const valid = {
  firstName: ' Mara ',
  lastName: 'Santos',
  mobileNumber: '09171234567',
  email: '',
  messengerName: ' mara.santos ',
  birthdate: '1994-06-12',
  gender: 'female',
  civilStatus: 'married',
  branchId: 'b1',
};

describe('parseMemberCreate', () => {
  it('trims fields and stores empty optionals as null', () => {
    expect(parseMemberCreate(valid)).toEqual({
      firstName: 'Mara',
      lastName: 'Santos',
      mobileNumber: '09171234567',
      email: null,
      messengerName: 'mara.santos',
      birthdate: new Date('1994-06-12T00:00:00.000Z'),
      gender: 'female',
      civilStatus: 'married',
      branchId: 'b1',
      isDgroupLeader: false,
      dgroupMeetings: [],
    });
  });

  it.each([
    ['a missing first name', { firstName: ' ' }],
    ['a bad email', { email: 'nope' }],
    ['a bad gender', { gender: 'other' }],
    ['a bad civil status', { civilStatus: 'engaged' }],
    ['a malformed birthdate', { birthdate: '12/06/1994' }],
    ['an impossible birthdate', { birthdate: '2026-02-31' }],
    ['a future birthdate', { birthdate: '2999-01-01' }],
    ['a missing branch', { branchId: '' }],
  ])('rejects %s', (_label, patch) => {
    expect(() => parseMemberCreate({ ...valid, ...patch })).toThrow(
      BadRequestException,
    );
  });

  it('keeps dgroup meetings for a leader, with sorted unique days', () => {
    const member = parseMemberCreate({
      ...valid,
      isDgroupLeader: true,
      dgroupMeetings: [
        {
          name: ' Young adults ',
          description: ' After work ',
          days: ['friday', 'wednesday', 'friday'],
          time: '19:00',
        },
      ],
    });
    expect(member.dgroupMeetings).toEqual([
      {
        name: 'Young adults',
        description: 'After work',
        days: ['wednesday', 'friday'],
        time: '19:00',
      },
    ]);
  });

  it('rejects meetings for someone who is not a leader', () => {
    expect(() =>
      parseMemberCreate({
        ...valid,
        dgroupMeetings: [{ name: 'A', days: ['monday'], time: '19:00' }],
      }),
    ).toThrow(BadRequestException);
  });

  it.each([
    ['no days', { name: 'A', days: [], time: '19:00' }],
    ['an unknown day', { name: 'A', days: ['funday'], time: '19:00' }],
    ['a bad time', { name: 'A', days: ['monday'], time: '7pm' }],
    ['no name', { name: ' ', days: ['monday'], time: '19:00' }],
  ])('rejects a meeting with %s', (_label, meeting) => {
    expect(() =>
      parseMemberCreate({
        ...valid,
        isDgroupLeader: true,
        dgroupMeetings: [meeting],
      }),
    ).toThrow(BadRequestException);
  });
});

describe('parseMemberUpdate', () => {
  it('returns only the fields that were sent', () => {
    expect(parseMemberUpdate({ firstName: ' Ana ', email: '' })).toEqual({
      firstName: 'Ana',
      email: null,
    });
  });

  it('ignores approved so an update cannot approve a member', () => {
    expect(parseMemberUpdate({ lastName: 'Cruz', approved: true })).toEqual({
      lastName: 'Cruz',
    });
  });

  it('rejects an empty update', () => {
    expect(() => parseMemberUpdate({ approved: true })).toThrow(
      BadRequestException,
    );
  });
});

describe('parseMemberFilters', () => {
  it('reads approved, branch and search', () => {
    expect(
      parseMemberFilters({ approved: 'false', branchId: 'b1', search: ' mar ' }),
    ).toEqual({ approved: false, branchId: 'b1', search: 'mar' });
  });

  it('rejects a bad approved value', () => {
    expect(() => parseMemberFilters({ approved: 'maybe' })).toThrow(
      BadRequestException,
    );
  });
});
