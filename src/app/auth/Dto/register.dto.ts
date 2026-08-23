// src/app/auth/Dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'Franck Kamdem',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  name!: string;

  @ApiProperty({
    description: "Adresse email unique de l'utilisateur",
    example: 'franck.dev@example.com',
  })
  @IsEmail({}, { message: "L'adresse email doit être valide." })
  email!: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur (6 caractères minimum)",
    example: 'MonSuperSecret123',
    minLength: 6,
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  password!: string;

  @ApiPropertyOptional({
    description: "Rôle de l'utilisateur au sein de la plateforme Lumina",
    enum: Role,
    example: Role.SUBSCRIBER,
    default: Role.SUBSCRIBER,
  })
  @IsOptional()
  @IsEnum(Role, {
    message: 'Le rôle fourni doit être un rôle valide de la plateforme.',
  })
  role?: Role;

  @ApiPropertyOptional({
    description:
      "Identifiant unique Google (requis uniquement pour l'authentification sociale)",
    example: '110294758392019485736',
  })
  @IsOptional()
  @IsString({ message: 'Le googleId doit être une chaîne de caractères.' })
  googleId?: string;

  @ApiPropertyOptional({
    description: 'URL de la photo de profil (ex: récupérée depuis Google)',
    example: 'https://lh3.googleusercontent.com/a/ACg8oc...',
  })
  @IsOptional()
  @IsString({
    message: "L'URL de l'avatar doit être une chaîne de caractères.",
  })
  avatar?: string;
}
