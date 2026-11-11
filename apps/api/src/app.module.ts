import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ArticlesModule } from './articles/articles.module.js';
import { ChurchBranchesModule } from './church-branches/church-branches.module.js';
import { ContentModule } from './content/content.module.js';
import { GlcModule } from './glc/glc.module.js';
import { MembersModule } from './members/members.module.js';
import { SeriesModule } from './series/series.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ArticlesModule,
    ChurchBranchesModule,
    ContentModule,
    GlcModule,
    MembersModule,
    SeriesModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
