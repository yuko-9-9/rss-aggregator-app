// feed.controller.ts
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}
  @Get()
  async findAll() {
    return this.feedService.fetchAllFeeds();
  }

  // 個別取得API追加！
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const feed = await this.feedService.findOne(id);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }
    return feed;
  }
}
