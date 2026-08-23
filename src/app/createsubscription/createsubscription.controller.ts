import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';

import { SubscriptionStatus } from '@prisma/client';
import { SubscriptionsService } from './createsubscription.service';
import { CreateSubscriptionDto } from './dto/create-createsubscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Get('user/:userId')
  getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }

  @Get('user/:userId/active')
  getActiveSubscription(@Param('userId') userId: string) {
    return this.subscriptionsService.getActiveSubscription(userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: SubscriptionStatus,
  ) {
    return this.subscriptionsService.updateStatus(id, status);
  }
}
