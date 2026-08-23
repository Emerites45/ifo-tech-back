// src/videos/dto/create-video.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateVideoDto {
  @ApiProperty({ description: 'Titre de la vidéo' })
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID du cours rattaché' })
  @IsNotEmpty({ message: "L'ID du cours est obligatoire" })
  @IsString()
  courseId!: string;

  @ApiPropertyOptional({ description: 'Durée en secondes', default: 0 })
  @IsOptional()
  @Type(() => Number) // 👈 Convertit la string issue du form-data en Number
  @IsNumber({}, { message: 'La durée doit être un nombre' })
  @Min(0, { message: 'La durée ne peut pas être négative' })
  duration?: number;

  @ApiPropertyOptional({ description: 'Ordre d’affichage', default: 0 })
  @IsOptional()
  @Type(() => Number) // 👈 Convertit la string issue du form-data en Number
  @IsNumber({}, { message: "L'ordre doit être un nombre" })
  @Min(0, { message: "L'ordre ne peut pas être négatif" })
  order?: number;

  @ApiPropertyOptional({ description: 'Vidéo gratuite ou non', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // 👈 Convertit "true" string en boolean true
  @IsBoolean({ message: 'isFree doit être un booléen' })
  isFree?: boolean;

  // ⚠️ TRÈS IMPORTANT : Doit être optionnel pour passer la validation du Body avant le controller !
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
