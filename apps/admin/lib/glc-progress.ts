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
