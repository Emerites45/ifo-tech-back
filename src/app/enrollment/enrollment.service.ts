import { ConflictException, Injectable } from '@nestjs/common';
import { EnrollmentsRepository } from './repository/enrollments.repository';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Enrollment } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly repository: EnrollmentsRepository) {}

  async enroll(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const existing = await this.repository.findByUserAndCourse(
      dto.userId,
      dto.courseId,
    );
    if (existing) {
      throw new ConflictException('Utilisateur déjà inscrit à ce cours.');
    }

    return this.repository.create({
      user: { connect: { id: dto.userId } },
      course: { connect: { id: dto.courseId } },
    });
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return this.repository.findByUserId(userId);
  }

  async unenroll(userId: string, courseId: string): Promise<Enrollment> {
    return this.repository.delete(userId, courseId);
  }
}
