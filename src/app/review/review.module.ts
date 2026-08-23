import { Module } from '@nestjs/common';

import { ReviewsRepository } from './repository/reviews.repository';
import { ReviewsService } from './review.service';
import { ReviewsController } from './review.controller';
import { RedisCacheModule } from 'src/common/cache/cache.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [RedisCacheModule, DatabaseModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
