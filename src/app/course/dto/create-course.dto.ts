import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Category } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Titre du cours',
    example: 'NestJS et Microservices : Le Guide Complet',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Description détaillée du contenu du cours',
    example:
      'Apprenez à concevoir des architectures distribuées scalables avec NestJS, Kafka et Redis.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: "URL de l'image de couverture du cours",
    example: 'https://cdn.example.com/thumbnails/nestjs-course.png',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Catégorie principale du cours',
    enum: Category,
    example: 'BACKEND',
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    description: 'Indique si le cours est publié ou encore en brouillon',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({
    description: "Identifiant unique (ID/UUID) de l'auteur du cours",
    example: 'usr_89f2a4b1-9c83-4a12-b912-3f8d7e6a5c4b',
  })
  @IsString()
  @IsNotEmpty()
  authorId!: string;
}
