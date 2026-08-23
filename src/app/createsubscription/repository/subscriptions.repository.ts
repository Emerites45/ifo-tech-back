/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Prisma, Subscription } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return this.db.extendedClient.subscription.create({ data });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.db.extendedClient.subscription.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findActiveUserSubscription(
    userId: string,
  ): Promise<Subscription | null> {
    return this.db.extendedClient.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });
  }

  async updateStatus(
    id: string,
    status: Prisma.SubscriptionUpdateInput['status'],
  ): Promise<Subscription> {
    return this.db.extendedClient.subscription.update({
      where: { id },
      data: { status },
    });
  }
}
