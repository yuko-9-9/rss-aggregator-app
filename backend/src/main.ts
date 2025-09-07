import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  // 開発環境（production 以外）のときだけ .env を読み込む
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  /**
   * ポート設定
   * - Render などの本番環境 → process.env.PORT が自動で注入されるのでそれを利用
   * - ローカル → .env に PORT があれば使う。なければデフォルト 34567
   */
  const port = Number(process.env.PORT) || 34567;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log('Starting app with PORT:', process.env.PORT);
}
bootstrap();
