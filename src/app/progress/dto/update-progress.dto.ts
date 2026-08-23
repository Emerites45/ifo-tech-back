import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur visionnant la vidéo",
    example: 'usr_89f2a4b1-9c83-4a12-b912-3f8d7e6a5c4b',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Identifiant de la vidéo en cours de visionnage',
    example: 'vid_99f8e7d6-5c4b-3a21-0987-654321fedcba',
  })
  @IsString()
  @IsNotEmpty()
  videoId!: string;

  @ApiProperty({
    description: 'Temps total visionné en secondes',
    minimum: 0,
    example: 345,
  })
  @IsInt()
  @Min(0)
  watchedSec!: number;

  @ApiPropertyOptional({
    description: 'Marquer la vidéo comme entièrement terminée',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
