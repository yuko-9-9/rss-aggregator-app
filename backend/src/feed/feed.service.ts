import { Injectable } from '@nestjs/common';
import * as Parser from 'rss-parser';

const parser = new Parser();

@Injectable()
export class FeedService {
  private feedUrls = [
    'https://zenn.dev/feed', // Zenn（Techカテゴリ）
    'https://qiita.com/popular-items/feed', //Qiita（新着）
    'https://developer.hatenastaff.com/feed', //Hatena Developer Blog
    'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', //ITmedia
  ];

  async fetchAllFeeds() {
    // feedUrlsのRSSを全部パースして中身返す
    const allFeeds = await Promise.all(
      this.feedUrls.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          return {
            title: feed.title,
            items: feed.items.slice(0, 5),
          };
        } catch (err) {
          return { title: url, items: [], error: true };
        }
      }),
    );
    return allFeeds;
  }

  async findOne(id: string) {
    const index = Number(id);
    if (isNaN(index)) return null;

    const url = this.feedUrls[index];
    if (!url) return null;

    try {
      const feed = await parser.parseURL(url);
      return {
        title: feed.title,
        items: feed.items.slice(0, 5),
      };
    } catch (err) {
      return { title: url, items: [], error: true };
    }
  }
}
