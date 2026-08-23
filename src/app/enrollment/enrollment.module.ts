import { Module } from '@nestjs/common';

import { EnrollmentsRepository } from './repository/enrollments.repository';
import { EnrollmentsController } from './enrollment.controller';
import { EnrollmentsService } from './enrollment.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentsRepository],
  exports: [EnrollmentsService, EnrollmentsRepository],
})
export class EnrollmentsModule {}
