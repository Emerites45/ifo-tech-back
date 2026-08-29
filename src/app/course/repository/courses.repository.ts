/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    // Construction de la clause 'where' en excluant les cours supprimés (soft delete)
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
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
      where: {
        id,
        deletedAt: null, // S'assure de ne pas récupérer un cours supprimé
      },
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
    // Vrai Soft Delete : mise à jour du champ deletedAt au lieu d'une suppression physique
    return this.db.extendedClient.course.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
