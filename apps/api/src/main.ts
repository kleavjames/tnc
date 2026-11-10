import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadEnvFiles } from './load-env.js';

async function bootstrap() {
  loadEnvFiles();
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors({
    origin: process.env.ADMIN_ORIGIN ?? 'http://localhost:3001',
  });
  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
