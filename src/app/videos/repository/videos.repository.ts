/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Prisma, Video } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class VideosRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.VideoCreateInput): Promise<Video> {
    return this.db.extendedClient.video.create({ data });
  }

  async findByCourseId(courseId: string): Promise<Video[]> {
    return this.db.extendedClient.video.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async findActiveById(id: string): Promise<Video | null> {
    return this.db.extendedClient.video.findFirst({
      where: { id },
      include: { course: true },
    });
  }

  async update(id: string, data: Prisma.VideoUpdateInput): Promise<Video> {
    return this.db.extendedClient.video.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Video> {
    return this.db.extendedClient.video.delete({
      where: { id },
    });
  }
}
