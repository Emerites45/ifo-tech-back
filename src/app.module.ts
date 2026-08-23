import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideosModule } from './app/videos/videos.module';
import { CoursesModule } from './app/course/course.module';
import { SubscriptionsModule } from './app/createsubscription/createsubscription.module';
import { EnrollmentsModule } from './app/enrollment/enrollment.module';
import { VideoProgressModule } from './app/progress/progress.module';
import { ReviewsModule } from './app/review/review.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'], // S'assure que Nest lit bien le .env à la racine du projet
    }),
    CoursesModule,
    VideosModule,
    SubscriptionsModule,
    EnrollmentsModule,
    VideoProgressModule,
    ReviewsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
