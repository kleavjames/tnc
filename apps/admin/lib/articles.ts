export type ArticleType = "glc" | "life-on-life" | "sermons";

export type Article = {
  id: string;
  title: string;
  scripture: string;
  speaker: string;
  series: string;
  type: ArticleType;
  dateUploaded: string;
};

export const ARTICLES: Article[] = [
  {
    id: "the-god-who-stays",
    title: "The God Who Stays",
    scripture: "Matthew 28:20",
    speaker: "Ptr. Daniel Reyes",
    series: "Emmanuel",
    type: "sermons",
    dateUploaded: "Dec 28, 2025",
  },
  {
    id: "love-that-transforms",
    title: "Love That Transforms",
    scripture: "1 John 4:7-12",
    speaker: "Ptr. Daniel Reyes",
    series: "Emmanuel",
    type: "sermons",
    dateUploaded: "Dec 21, 2025",
  },
  {
    id: "room-for-him",
    title: "Room for Him",
    scripture: "Luke 2:1-7",
    speaker: "Ptr. Grace Lim",
    series: "Emmanuel",
    type: "sermons",
    dateUploaded: "Dec 14, 2025",
  },
  {
    id: "waiting-well",
    title: "Waiting Well",
    scripture: "Isaiah 40:27-31",
    speaker: "Ptr. Daniel Reyes",
    series: "Emmanuel",
    type: "life-on-life",
    dateUploaded: "Dec 7, 2025",
  },
  {
    id: "grateful-hearts",
    title: "Grateful Hearts",
    scripture: "Psalm 100",
    speaker: "Bro. Mark Tan",
    series: "Standalone",
    type: "life-on-life",
    dateUploaded: "Nov 30, 2025",
  },
  {
    id: "rooted",
    title: "Rooted",
    scripture: "Colossians 2:6-7",
    speaker: "Ptr. Grace Lim",
    series: "New Year 2026",
    type: "glc",
    dateUploaded: "Jan 4, 2026",
  },
  {
    id: "salt-and-light",
    title: "Salt and Light",
    scripture: "Matthew 5:13-16",
    speaker: "Ptr. Daniel Reyes",
    series: "Sermon on the Mount",
    type: "glc",
    dateUploaded: "Nov 23, 2025",
  },
  {
    id: "ask-seek-knock",
    title: "Ask, Seek, Knock",
    scripture: "Matthew 7:7-12",
    speaker: "Ptr. Grace Lim",
    series: "Sermon on the Mount",
    type: "glc",
    dateUploaded: "Nov 16, 2025",
  },
];

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  glc: "GLC",
  "life-on-life": "Life on Life",
  sermons: "Sermons",
};

export const ARTICLE_TYPE_COUNTS = {
  all: ARTICLES.length,
  glc: ARTICLES.filter((article) => article.type === "glc").length,
  "life-on-life": ARTICLES.filter((article) => article.type === "life-on-life")
    .length,
  sermons: ARTICLES.filter((article) => article.type === "sermons").length,
} as const;

export const ARTICLE_SERIES = [
  "Emmanuel",
  "Standalone",
  "New Year 2026",
  "Sermon on the Mount",
] as const;
