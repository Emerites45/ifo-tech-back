import { Module } from '@nestjs/common';

import { SubscriptionsRepository } from './repository/subscriptions.repository';
import { SubscriptionsController } from './createsubscription.controller';
import { SubscriptionsService } from './createsubscription.service';
import { RedisCacheModule } from 'src/common/cache/cache.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [RedisCacheModule, DatabaseModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsRepository],
  exports: [SubscriptionsService, SubscriptionsRepository],
})
export class SubscriptionsModule {}
