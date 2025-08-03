import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv'; // ← 追加
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config(); // ← これを追加

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 34567;
  // await app.listen(port);
  // zこの書き方やと NestJS はデフォで localhost（＝ 127.0.0.1）に bind する。
  // Railway は外部から叩くので、0.0.0.0 に bind しないと外部からアクセスできん → 502 になる。
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
