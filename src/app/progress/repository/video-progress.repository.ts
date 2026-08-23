/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { VideoProgress } from '@prisma/client';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class VideoProgressRepository {
  constructor(private readonly db: DatabaseService) {}

  async upsert(dto: UpdateProgressDto): Promise<VideoProgress> {
    return this.db.extendedClient.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: dto.userId,
          videoId: dto.videoId,
        },
      },
      create: {
        userId: dto.userId,
        videoId: dto.videoId,
        watchedSec: dto.watchedSec,
        isCompleted: dto.isCompleted ?? false,
      },
      update: {
        watchedSec: dto.watchedSec,
        ...(dto.isCompleted !== undefined
          ? { isCompleted: dto.isCompleted }
          : {}),
      },
    });
  }

  async findByUserAndVideo(
    userId: string,
    videoId: string,
  ): Promise<VideoProgress | null> {
    return this.db.extendedClient.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
  }
}
