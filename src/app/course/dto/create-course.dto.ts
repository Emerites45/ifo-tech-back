/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
    example: 'Apprenez à concevoir des architectures distribuées scalables...',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: 'Catégorie principale du cours',
    enum: Category,
    example: 'BACKEND',
  })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiPropertyOptional({
    description: 'Nombre de leçons dans le cours',
    example: 12,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  lessons?: number;

  @ApiPropertyOptional({
    description: 'Durée totale estimée du cours',
    example: '4h 30m',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Prix du cours',
    example: '49.99$',
  })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({
    description:
      'Liste des sujets du programme (format tableau ou JSON string si FormData)',
    example: ['Introduction', 'Microservices', 'Docker'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  curriculum?: string[];

  @ApiPropertyOptional({
    description: 'Indique si le cours est publié',
    default: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
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
