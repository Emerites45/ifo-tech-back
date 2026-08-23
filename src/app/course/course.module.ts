import { Module } from '@nestjs/common';

import { CoursesRepository } from './repository/courses.repository';
import { CoursesController } from './course.controller';
import { CoursesService } from './course.service';
import { RedisCacheModule } from 'src/common/cache/cache.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [RedisCacheModule, DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepository],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
