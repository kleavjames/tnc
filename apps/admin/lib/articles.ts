export type ArticleStatus = "published" | "scheduled" | "draft";

export type Article = {
  id: string;
  title: string;
  scripture: string;
  speaker: string;
  series: string;
  serviceDate: string;
  files: Array<"PDF" | "MP3">;
  downloads: number | null;
  status: ArticleStatus;
};

export const ARTICLES: Article[] = [
  {
    id: "the-god-who-stays",
    title: "The God Who Stays",
    scripture: "Matthew 28:20",
    speaker: "Ptr. Daniel Reyes",
    series: "Emmanuel",
    serviceDate: "Dec 28, 2025",
    files: ["PDF", "MP3"],
    downloads: null,
    status: "scheduled",
  },
  {
    id: "love-that-transforms",
    title: "Love That Transforms",
    scripture: "1 John 4:7-12",
    speaker: "Ptr. Daniel Reyes",
    series: "Emmanuel",
    serviceDate: "Dec 21, 2025",
    files: ["PDF", "MP3"],
    downloads: 312,
    status: "published",
  },
  {
    id: "room-for-him",
    title: "Room for Him",
    scripture: "Luke 2:1-7",
    speaker: "Ptr. Grace Lim",
    series: "Emmanuel",
    serviceDate: "Dec 14, 2025",
    files: ["PDF"],
    downloads: 248,
    status: "published",
  },
  {
    id: "waiting-well",
    title: "Waiting Well",
    scripture: "Isaiah 40:27-31",
    speaker: "Ptr. Daniel Reyes",
    series: "Emmanuel",
    serviceDate: "Dec 7, 2025",
    files: ["PDF", "MP3"],
    downloads: 290,
    status: "published",
  },
  {
    id: "grateful-hearts",
    title: "Grateful Hearts",
    scripture: "Psalm 100",
    speaker: "Bro. Mark Tan",
    series: "Standalone",
    serviceDate: "Nov 30, 2025",
    files: ["MP3"],
    downloads: 176,
    status: "published",
  },
  {
    id: "rooted",
    title: "Rooted",
    scripture: "Colossians 2:6-7",
    speaker: "Ptr. Grace Lim",
    series: "New Year 2026",
    serviceDate: "Jan 4, 2026",
    files: ["PDF"],
    downloads: null,
    status: "draft",
  },
  {
    id: "salt-and-light",
    title: "Salt and Light",
    scripture: "Matthew 5:13-16",
    speaker: "Ptr. Daniel Reyes",
    series: "Sermon on the Mount",
    serviceDate: "Nov 23, 2025",
    files: ["PDF", "MP3"],
    downloads: 205,
    status: "published",
  },
  {
    id: "ask-seek-knock",
    title: "Ask, Seek, Knock",
    scripture: "Matthew 7:7-12",
    speaker: "Ptr. Grace Lim",
    series: "Sermon on the Mount",
    serviceDate: "Nov 16, 2025",
    files: ["PDF", "MP3"],
    downloads: 231,
    status: "published",
  },
];

export const ARTICLE_STATUS_COUNTS = {
  all: 24,
  published: 21,
  scheduled: 1,
  drafts: 2,
} as const;

export const ARTICLE_SERIES = [
  "Emmanuel",
  "Standalone",
  "New Year 2026",
  "Sermon on the Mount",
] as const;
