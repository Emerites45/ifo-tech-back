import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { VideosRepository } from './repository/videos.repository';
import { RedisCacheModule } from 'src/common/cache/cache.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [RedisCacheModule, DatabaseModule],
  controllers: [VideosController],
  providers: [VideosService, VideosRepository],
  exports: [VideosService, VideosRepository],
})
export class VideosModule {}
