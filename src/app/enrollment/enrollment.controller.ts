import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentsService } from './enrollment.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Get('user/:userId')
  getUserEnrollments(@Param('userId') userId: string) {
    return this.enrollmentsService.getUserEnrollments(userId);
  }

  @Delete('user/:userId/course/:courseId')
  unenroll(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.unenroll(userId, courseId);
  }
}
