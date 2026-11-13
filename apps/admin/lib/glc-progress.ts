export type GlcSessionProgress = {
  id: string;
  number: number;
  title: string;
  attended: boolean;
};

export type GlcBookProgress = {
  id: string;
  number: number;
  title: string;
  sessions: GlcSessionProgress[];
};

export type GlcLevelProgress = {
  id: string;
  level: number;
  name: string;
  title: string;
  books: GlcBookProgress[];
};

export type GlcProgress = {
  id: string;
  memberId: string;
  attendedCount: number;
  sessionCount: number;
  levels: GlcLevelProgress[];
};

export type GlcAttendanceSession = {
  id: string;
  number: number;
  title: string;
};

export type GlcAttendanceBook = {
  id: string;
  number: number;
  title: string;
  sessions: GlcAttendanceSession[];
};

export type GlcAttendanceLevel = {
  id: string;
  level: number;
  name: string;
  title: string;
  books: GlcAttendanceBook[];
};

export type GlcAttendanceMember = {
  id: string;
  firstName: string;
  lastName: string;
  branch: { id: string; name: string; branch: string };
  attendedSessionIds: string[];
};

export type GlcAttendance = {
  levels: GlcAttendanceLevel[];
  members: GlcAttendanceMember[];
};
