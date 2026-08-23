import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VideosRepository } from './repository/videos.repository';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from '@prisma/client';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class VideosService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreateVideoDto): Promise<Video> {
    // S'assure qu'une URL a bien été générée par le contrôleur
    if (!dto.videoUrl) {
      throw new BadRequestException("L'URL de la vidéo n'a pas été générée.");
    }

    const video = await this.videosRepository.create({
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl, // Désormais garanti comme string non undefined
      duration: dto.duration ? Number(dto.duration) : 0,
      order: dto.order ? Number(dto.order) : 0,
      isFree: dto.isFree === true || (dto.isFree as any) === 'true',
      course: { connect: { id: dto.courseId } },
    });

    await this.cacheService.delete(`course:${dto.courseId}`);
    await this.cacheService.delete(`videos:course:${dto.courseId}`);

    return video;
  }

  async findByCourse(courseId: string): Promise<Video[]> {
    const cacheKey = `videos:course:${courseId}`;
    const cached = await this.cacheService.get<Video[]>(cacheKey);
    if (cached) return cached;

    const videos = await this.videosRepository.findByCourseId(courseId);
    await this.cacheService.set(cacheKey, videos, 300);
    return videos;
  }

  async findOne(id: string): Promise<Video> {
    const cacheKey = `video:${id}`;
    const cached = await this.cacheService.get<Video>(cacheKey);
    if (cached) return cached;

    const video = await this.videosRepository.findActiveById(id);
    if (!video) {
      throw new NotFoundException(`La vidéo avec l'ID ${id} n'existe pas.`);
    }

    await this.cacheService.set(cacheKey, video, 300);
    return video;
  }

  async update(id: string, dto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id);
    const updated = await this.videosRepository.update(id, dto);
    await this.cacheService.delete(`video:${id}`);
    await this.cacheService.delete(`videos:course:${video.courseId}`);
    return updated;
  }

  async remove(id: string): Promise<Video> {
    const video = await this.findOne(id);
    const deleted = await this.videosRepository.softDelete(id);
    await this.cacheService.delete(`video:${id}`);
    await this.cacheService.delete(`videos:course:${video.courseId}`);
    return deleted;
  }
}
