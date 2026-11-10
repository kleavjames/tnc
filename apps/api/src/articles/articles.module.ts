import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}