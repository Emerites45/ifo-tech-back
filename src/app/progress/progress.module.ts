import { Module } from '@nestjs/common';

import { VideoProgressRepository } from './repository/video-progress.repository';
import { VideoProgressController } from './progress.controller';
import { VideoProgressService } from './progress.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VideoProgressController],
  providers: [VideoProgressService, VideoProgressRepository],
  exports: [VideoProgressService, VideoProgressRepository],
})
export class VideoProgressModule {}
