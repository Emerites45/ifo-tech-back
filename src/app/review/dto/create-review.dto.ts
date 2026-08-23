import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Note attribuée au cours (de 1 à 5 stars)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Avis textuel ou commentaire explicatif',
    example:
      'Excellent cours, très bien expliqué avec des cas pratiques concrets !',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: "Identifiant de l'auteur de l'avis",
    example: 'usr_89f2a4b1-9c83-4a12-b912-3f8d7e6a5c4b',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Identifiant du cours évalué',
    example: 'crs_12a34b56-78c9-0d12-e34f-56a78b90c12d',
  })
  @IsString()
  @IsNotEmpty()
  courseId!: string;
}
