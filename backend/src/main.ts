import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  // ローカルだけ .env 読む
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // ローカルでは .env の PORT（例：34567）を使う。Railway では process.env.PORT が自動で入る
  const port = Number(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
