export type FeedItem = {
  title: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
};

export type Feed = {
  title: string;
  items: FeedItem[];
  error?: boolean;
};
