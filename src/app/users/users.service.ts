/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';
import { CacheService } from 'src/common/cache/cache.service';
import { PaginationPayloadDto, PaginationResponseDto } from 'src/main/apiutils';
import { CompletePublisherProfileDto } from './Dto/complete-creator-profile.dto';
import { CreateUserDto } from './Dto/user.create.dto';
import { UpdateUserDto } from './Dto/user.update.dto';
import { UsersRepository } from './repository/users.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService,
  ) {}
  async create(createUser: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findActiveByEmail(
      createUser.email,
    );
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    // 1. Récupération du nom complet avec fallback sur name ou chaine vide
    const displayName = createUser.fullName || createUser.name || '';

    // 2. Gestion et hachage du mot de passe
    let hashedPassword = '';
    if (createUser.password) {
      hashedPassword = await bcrypt.hash(createUser.password, SALT_ROUNDS);
    } else if (createUser.googleId) {
      const randomPassword =
        Math.random().toString(36).slice(-16) +
        Math.random().toString(36).slice(-16);
      hashedPassword = await bcrypt.hash(randomPassword, SALT_ROUNDS);
    } else {
      throw new BadRequestException(
        'Le mot de passe ou le googleId est requis.',
      );
    }

    // 3. Définition du rôle par défaut si non fourni
    const userRole = createUser.role ?? Role.SUBSCRIBER;

    // 4. Construction de l'objet pour Prisma / Repository
    const userData: any = {
      name: displayName,
      email: createUser.email,
      passwordHash: hashedPassword,
      role: userRole,
      googleId: createUser.googleId ?? null,
      avatar: createUser.avatar ?? null,
      phoneNumber: createUser.phoneNumber ?? null,
    };

    // 5. Création automatique du profil d'éditeur si le rôle est PUBLISHER
    if (userRole === Role.PUBLISHER) {
      userData.publisherProfile = {
        create: {
          specialty: 'OTHER',
        },
      };
    }

    const user = await this.usersRepository.create(userData);
    await this.cacheService.delete('users:list');

    return user;
  }

  async findAll(
    pagination: PaginationPayloadDto,
    role?: Role,
  ): Promise<PaginationResponseDto<User>> {
    const { page, take } = pagination;
    const cacheKey = `users:role:${role ?? 'all'}:page:${page}:take:${take}`;

    const cached =
      await this.cacheService.get<PaginationResponseDto<User>>(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * take;
    const [users, total] = await this.usersRepository.findAllActive(
      role,
      skip,
      take,
    );

    const result = PaginationResponseDto.responseDto(pagination, users, total);
    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheService.get<User>(cacheKey);
    if (cached) return cached;

    const user = await this.usersRepository.findActiveById(id);
    if (!user) {
      throw new NotFoundException(
        `L'utilisateur avec l'ID ${id} n'existe pas ou a été supprimé.`,
      );
    }

    await this.cacheService.set(cacheKey, user, 300);
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findActiveByEmail(email);
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findActiveByGoogleId(googleId);
  }

  async update(id: string, updateUser: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    const updateData: any = { ...updateUser };

    if (updateUser.password) {
      updateData.passwordHash = await bcrypt.hash(
        updateUser.password,
        SALT_ROUNDS,
      );
      delete updateData.password;
    }

    const updatedUser = await this.usersRepository.update(id, updateData);
    await this.cacheService.delete(`user:${id}`);
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id);

    const deletedUser = await this.usersRepository.softDelete(id);
    await this.cacheService.delete(`user:${id}`);
    return deletedUser;
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async completePublisherProfile(
    userId: string,
    dto: CompletePublisherProfileDto,
  ) {
    const user = await this.findOne(userId);

    if (user.role !== Role.PUBLISHER) {
      await this.usersRepository.update(userId, { role: Role.PUBLISHER });
    }

    const profile = await this.usersRepository.upsertPublisherProfile(
      userId,
      dto,
    );
    await this.cacheService.delete(`user:${userId}`);
    return profile;
  }
}
