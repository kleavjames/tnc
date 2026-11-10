import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ArticlesModule } from './articles/articles.module.js';
import { ContentModule } from './content/content.module.js';
import { SeriesModule } from './series/series.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ArticlesModule,
    ContentModule,
    SeriesModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
