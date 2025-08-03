import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv'; // ← 追加
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config(); // ← これを追加

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 34567;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
