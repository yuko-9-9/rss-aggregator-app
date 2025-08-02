import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // tech系のフィード全件取得
  @Get('tech')
  async getTechFeeds() {
    return this.feedService.fetchAllFeeds('tech');
  }

  // まとめ系のフィード全件取得
  @Get('matome')
  async getMatomeFeeds() {
    return this.feedService.fetchAllFeeds('matome');
  }

  // tech系の個別取得
  @Get('tech/:id')
  async getTechFeed(@Param('id') id: string) {
    const feed = await this.feedService.findOne('tech', id);
    if (!feed) {
      throw new NotFoundException('Tech feed not found');
    }
    return feed;
  }

  // まとめ系の個別取得
  @Get('matome/:id')
  async getMatomeFeed(@Param('id') id: string) {
    const feed = await this.feedService.findOne('matome', id);
    if (!feed) {
      throw new NotFoundException('Matome feed not found');
    }
    return feed;
  }
}
