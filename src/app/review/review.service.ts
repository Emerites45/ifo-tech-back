import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './repository/reviews.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from '@prisma/client';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repository: ReviewsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const review = await this.repository.create({
      rating: dto.rating,
      comment: dto.comment,
      user: { connect: { id: dto.userId } },
      course: { connect: { id: dto.courseId } },
    });
    await this.cacheService.delete(`course:${dto.courseId}`);
    return review;
  }

  async getCourseReviews(courseId: string): Promise<Review[]> {
    return this.repository.findByCourseId(courseId);
  }

  async delete(userId: string, courseId: string): Promise<Review> {
    const deleted = await this.repository.delete(userId, courseId);
    await this.cacheService.delete(`course:${courseId}`);
    return deleted;
  }
}
