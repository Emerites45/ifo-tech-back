import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur qui s'inscrit au cours",
    example: 'usr_89f2a4b1-9c83-4a12-b912-3f8d7e6a5c4b',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Identifiant du cours concerné par l inscription',
    example: 'crs_12a34b56-78c9-0d12-e34f-56a78b90c12d',
  })
  @IsString()
  @IsNotEmpty()
  courseId!: string;
}
