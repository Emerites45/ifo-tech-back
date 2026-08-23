/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Enrollment, Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.EnrollmentCreateInput): Promise<Enrollment> {
    return this.db.extendedClient.enrollment.create({ data });
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.db.extendedClient.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async findByUserId(userId: string): Promise<Enrollment[]> {
    return this.db.extendedClient.enrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(userId: string, courseId: string): Promise<Enrollment> {
    return this.db.extendedClient.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}
