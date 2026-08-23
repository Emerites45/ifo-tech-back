import { Injectable } from '@nestjs/common';
import { VideoProgressRepository } from './repository/video-progress.repository';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { VideoProgress } from '@prisma/client';

@Injectable()
export class VideoProgressService {
  constructor(private readonly repository: VideoProgressRepository) {}

  async updateProgress(dto: UpdateProgressDto): Promise<VideoProgress> {
    return this.repository.upsert(dto);
  }

  async getProgress(
    userId: string,
    videoId: string,
  ): Promise<VideoProgress | null> {
    return this.repository.findByUserAndVideo(userId, videoId);
  }
}
