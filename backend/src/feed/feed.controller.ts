import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // =========================
  // 一覧取得（トップ用）
  // =========================

  @Get('tech')
  async getTechFeeds() {
    return this.feedService.fetchAllFeeds('tech');
  }

  @Get('matome')
  async getMatomeFeeds() {
    return this.feedService.fetchAllFeeds('matome');
  }

  // =========================
  // 個別取得（5件・更新ボタン用）
  // =========================

  @Get('tech/:id')
  async getTechFeed(@Param('id') id: string) {
    const feed = await this.feedService.findOne('tech', id);
    if (!feed) {
      throw new NotFoundException('Tech feed not found');
    }
    return feed;
  }

  @Get('matome/:id')
  async getMatomeFeed(@Param('id') id: string) {
    const feed = await this.feedService.findOne('matome', id);
    if (!feed) {
      throw new NotFoundException('Matome feed not found');
    }
    return feed;
  }

  // =========================
  // 個別取得（100件・詳細ページ用）
  // =========================
  @Get(':category/:id/detail')
  async getFeedDetail(
    @Param('category') category: 'tech' | 'matome',
    @Param('id') id: string,
  ) {
    const feed = await this.feedService.findOne(category, id, 100);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }
    return feed;
  }
}
