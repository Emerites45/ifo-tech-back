/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Imports Swagger
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Uploader une nouvelle vidéo' })
  @ApiConsumes('multipart/form-data') // 👈 1. Indique à Swagger qu'il s'agit d'un envoi de fichier
  @ApiBody({
    description: 'Fichier vidéo et métadonnées associées',
    schema: {
      type: 'object',
      required: ['file', 'title', 'courseId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary', // 👈 2. Crée le champ "Choose File" dans l'UI Swagger
          description: 'Fichier vidéo (MP4, WEBM, etc.)',
        },
        title: { type: 'string', example: 'Introduction à NestJS' },
        description: { type: 'string', example: 'Description de la vidéo' },
        courseId: { type: 'string', example: 'uuid-du-cours' },
        duration: { type: 'number', example: 120 },
        order: { type: 'number', example: 1 },
        isFree: { type: 'boolean', example: false },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads', 'videos');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `video-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4|webm|ogg|quicktime)$/)) {
          return callback(
            new BadRequestException(
              'Seuls les fichiers vidéo sont autorisés !',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Le fichier vidéo est requis.');
    }

    // L'URL est construite ICI après le passage réussi de la validation du DTO
    const videoUrl = `/uploads/videos/${file.filename}`;

    return this.videosService.create({
      ...dto,
      videoUrl,
    });
  }
}
