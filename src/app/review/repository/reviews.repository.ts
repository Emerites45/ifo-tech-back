/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.db.extendedClient.review.create({ data });
  }

  async findByCourseId(courseId: string): Promise<Review[]> {
    return this.db.extendedClient.review.findMany({
      where: { courseId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(userId: string, courseId: string): Promise<Review> {
    return this.db.extendedClient.review.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}
