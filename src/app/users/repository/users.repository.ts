/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';

import { Prisma, Role, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CompletePublisherProfileDto } from '../Dto/complete-creator-profile.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.extendedClient.user.create({ data });
  }

  async findAllActive(
    role?: Role,
    skip?: number,
    take?: number,
  ): Promise<[User[], number]> {
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
    };

    return Promise.all([
      this.db.extendedClient.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.extendedClient.user.count({ where }),
    ]);
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.db.extendedClient.user.findFirst({
      where: { id },
      include: {
        publisherProfile: true,
        subscriptions: { where: { status: 'ACTIVE' } },
      },
    });
  }

  async findActiveByEmail(email: string): Promise<User | null> {
    return this.db.extendedClient.user.findFirst({
      where: { email },
    });
  }

  async findActiveByGoogleId(googleId: string): Promise<User | null> {
    return this.db.extendedClient.user.findFirst({
      where: { googleId },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.extendedClient.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.db.extendedClient.user.delete({
      where: { id },
    });
  }

  async upsertPublisherProfile(
    userId: string,
    dto: CompletePublisherProfileDto,
  ) {
    return this.db.extendedClient.publisherProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio,
        specialty: dto.specialty ?? 'OTHER',
        website: dto.website,
      },
      update: {
        bio: dto.bio,
        specialty: dto.specialty,
        website: dto.website,
      },
    });
  }
}
