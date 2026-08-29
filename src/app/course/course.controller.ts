/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Category } from '@prisma/client';
import { PaginationPayloadDto } from 'src/main/apiutils';
import { CoursesService } from './course.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau cours avec image de couverture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichier image et données du cours',
    schema: {
      type: 'object',
      required: ['title', 'description', 'authorId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image de couverture (PNG, JPG, WEBP, etc.)',
        },
        title: { type: 'string', example: 'NestJS et Microservices' },
        description: { type: 'string', example: 'Guide complet...' },
        category: { type: 'string', example: 'BACKEND' },
        lessons: { type: 'number', example: 10 },
        duration: { type: 'string', example: '5h' },
        price: { type: 'string', example: '29.99' },
        curriculum: {
          type: 'array',
          items: { type: 'string' },
          example: ['Module 1', 'Module 2'],
        },
        isPublished: { type: 'boolean', example: false },
        authorId: { type: 'string', example: 'usr_uuid_here' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads', 'images');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `course-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return callback(
            new BadRequestException(
              'Seuls les fichiers images (jpg, png, webp, gif) sont autorisés !',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // Limitée à 10 Mo pour une image
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateCourseDto,
  ) {
    const imageUrl = file ? `/uploads/images/${file.filename}` : undefined;
    return this.coursesService.create(dto, imageUrl);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationPayloadDto,
    @Query('category') category?: Category,
    @Query('isPublished') isPublished?: boolean,
  ) {
    return this.coursesService.findAll(pagination, category, isPublished);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
