/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './review.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Get('course/:courseId')
  getCourseReviews(@Param('courseId') courseId: string) {
    return this.reviewsService.getCourseReviews(courseId);
  }

  @Delete('user/:userId/course/:courseId')
  delete(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.reviewsService.delete(userId, courseId);
  }
}
