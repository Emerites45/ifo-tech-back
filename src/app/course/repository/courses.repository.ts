/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Category, Course, Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CoursesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    return this.db.extendedClient.course.create({ data });
  }

  async findAllActive(
    category?: Category,
    isPublished?: boolean,
    skip?: number,
    take?: number,
  ): Promise<[Course[], number]> {
    const where: Prisma.CourseWhereInput = {
      ...(category ? { category } : {}),
      ...(isPublished !== undefined ? { isPublished } : {}),
    };

    return Promise.all([
      this.db.extendedClient.course.findMany({
        where,
        skip,
        take,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          _count: {
            select: { videos: true, enrollments: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.extendedClient.course.count({ where }),
    ]);
  }

  async findActiveById(id: string): Promise<Course | null> {
    return this.db.extendedClient.course.findFirst({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        videos: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    return this.db.extendedClient.course.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Course> {
    return this.db.extendedClient.course.delete({
      where: { id },
    });
  }
}
