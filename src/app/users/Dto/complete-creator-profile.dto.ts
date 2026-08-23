import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Category } from '@prisma/client';

export class CompletePublisherProfileDto {
  @ApiPropertyOptional({
    description: "Biographie ou présentation de l'éditeur / formateur",
    example:
      'Développeur Full-Stack et formateur passionné depuis plus de 5 ans.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "Spécialité principale de l'éditeur",
    enum: Category,
    example: 'WEB_DEVELOPMENT',
  })
  @IsOptional()
  @IsEnum(Category)
  specialty?: Category;

  @ApiPropertyOptional({
    description: "Site web personnel ou portfolio de l'éditeur",
    example: 'https://monportfolio.dev',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Veuillez fournir une URL valide pour le site web' })
  website?: string;
}
