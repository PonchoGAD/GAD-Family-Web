export type Price = {
  GAD?: number;
  BNB?: number;
};

export type Toy = {
  slug: string;
  title: string;
  status: "preorder" | "available" | "soldout";
  price?: Price;
  images?: string[];
  specs?: string[];
  nftCollection?: string;
  shipEta?: string;
  ogImage?: string;
};

export type Game = {
  slug: string;
  title: string;
  type: "quest" | "quiz" | "mini-game";
  reward?: { GAD?: number };
  cooldownHours?: number;
  requirements?: string[];
  cta?: string;
  verification?: "server" | "client";
  ogImage?: string;
};

export type ChapterMeta = {
  slug: string;
  title: string;
  teaser?: string;
  order?: number;
  audio?: string;
  ogImage?: string;
};

export type ChapterSource = {
  frontmatter: ChapterMeta;
  content: string;
};
