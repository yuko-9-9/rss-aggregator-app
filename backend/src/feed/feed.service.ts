import { Injectable } from '@nestjs/common';
import * as Parser from 'rss-parser';

const parser = new Parser();

type FeedCategory = 'tech' | 'matome';

@Injectable()
export class FeedService {
  private feedUrlMap: Record<FeedCategory, string[]> = {
    tech: [
      'https://zenn.dev/feed',
      'https://qiita.com/popular-items/feed',
      'https://developer.hatenastaff.com/feed',
      'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml',
    ],
    matome: [
      'https://www.2nn.jp/rss/newsplus.rdf',
      'https://hamusoku.com/index.rdf',
      'http://himasoku.com/index.rdf',
      'http://workingnews117.com/?xml',
      'https://news4vip.livedoor.biz/index.rdf',
      'https://gigazine.net/news/rss_2.0/',
      'http://blog.livedoor.jp/news23vip/index.rdf',
      'https://rocketnews24.com/feed/',
      'http://vippers.jp/index.rdf',
      'https://www.fx2ch.net/feed',
      'https://itainews.com/index.rdf',
      'http://kanasoku.info/index.rdf',
      'https://www.news30over.com/index.rdf',
      'https://rss.itmedia.co.jp/rss/2.0/news_security.xml',
      'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml',
    ],
  };

  async fetchAllFeeds(category: FeedCategory) {
    const urls = this.feedUrlMap[category];

    const allFeeds = await Promise.all(
      urls.map(async (url) => {
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

  async findOne(category: FeedCategory, id: string) {
    const urls = this.feedUrlMap[category];
    const index = Number(id);
    if (isNaN(index)) return null;

    const url = urls[index];
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
