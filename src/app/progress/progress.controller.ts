import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { VideoProgressService } from './progress.service';

@Controller('video-progress')
export class VideoProgressController {
  constructor(private readonly videoProgressService: VideoProgressService) {}

  @Post()
  updateProgress(@Body() dto: UpdateProgressDto) {
    return this.videoProgressService.updateProgress(dto);
  }

  @Get('user/:userId/video/:videoId')
  getProgress(
    @Param('userId') userId: string,
    @Param('videoId') videoId: string,
  ) {
    return this.videoProgressService.getProgress(userId, videoId);
  }
}
