import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './repository/courses.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

import { Category, Course } from '@prisma/client';
import { CacheService } from 'src/common/cache/cache.service';
import { PaginationPayloadDto, PaginationResponseDto } from 'src/main/apiutils';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const course = await this.coursesRepository.create({
      title: dto.title,
      description: dto.description,
      thumbnail: dto.thumbnail,
      category: dto.category ?? 'OTHER',
      isPublished: dto.isPublished ?? false,
      author: { connect: { id: dto.authorId } },
    });
    await this.cacheService.delete('courses:list:*');
    return course;
  }

  async findAll(
    pagination: PaginationPayloadDto,
    category?: Category,
    isPublished?: boolean,
  ): Promise<PaginationResponseDto<Course>> {
    const { page, take } = pagination;
    const cacheKey = `courses:list:cat:${category ?? 'all'}:pub:${isPublished ?? 'all'}:p:${page}:t:${take}`;

    const cached =
      await this.cacheService.get<PaginationResponseDto<Course>>(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * take;
    const [courses, total] = await this.coursesRepository.findAllActive(
      category,
      isPublished,
      skip,
      take,
    );

    const result = PaginationResponseDto.responseDto(
      pagination,
      courses,
      total,
    );
    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }

  async findOne(id: string): Promise<Course> {
    const cacheKey = `course:${id}`;
    const cached = await this.cacheService.get<Course>(cacheKey);
    if (cached) return cached;

    const course = await this.coursesRepository.findActiveById(id);
    if (!course) {
      throw new NotFoundException(`Le cours avec l'ID ${id} n'existe pas.`);
    }

    await this.cacheService.set(cacheKey, course, 300);
    return course;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    await this.findOne(id);
    const updated = await this.coursesRepository.update(id, dto);
    await this.cacheService.delete(`course:${id}`);
    await this.cacheService.delete('courses:list:*');
    return updated;
  }

  async remove(id: string): Promise<Course> {
    await this.findOne(id);
    const deleted = await this.coursesRepository.softDelete(id);
    await this.cacheService.delete(`course:${id}`);
    await this.cacheService.delete('courses:list:*');
    return deleted;
  }
}
