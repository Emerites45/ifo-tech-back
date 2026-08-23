import { Injectable } from '@nestjs/common';
import { SubscriptionsRepository } from './repository/subscriptions.repository';

import { Subscription, SubscriptionStatus } from '@prisma/client';
import { CacheService } from 'src/common/cache/cache.service';
import { CreateSubscriptionDto } from './dto/create-createsubscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly repository: SubscriptionsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.repository.create({
      user: { connect: { id: dto.userId } },
      endDate: new Date(dto.endDate),
      status: dto.status ?? 'ACTIVE',
      note: dto.note,
    });
    await this.cacheService.delete(`user:${dto.userId}`);
    return subscription;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.repository.findByUserId(userId);
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.repository.findActiveUserSubscription(userId);
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    const updated = await this.repository.updateStatus(id, status);
    await this.cacheService.delete(`user:${updated.userId}`);
    return updated;
  }
}
