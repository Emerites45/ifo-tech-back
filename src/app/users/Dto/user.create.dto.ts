// src/app/users/Dto/user.create.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client'; // Utilise l'enum Prisma directement

export class CreateUserDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'franck.nzokou@ifo-tech.cm',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Mot de passe utilisateur',
    example: 'P@ssword2026!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'Franck Émérites Nzokou Fotso',
  })
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  // 💡 Alias optionnel pour éviter le crash si 'name' est passé
  @ApiPropertyOptional({
    description: "Nom complet de l'utilisateur (alias)",
    example: 'Franck Nzokou',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: Role,
    default: Role.SUBSCRIBER,
  })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    description: 'ID OAuth Google si connecté via Google',
    example: '1098230912830918',
  })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiPropertyOptional({
    description: "URL ou chemin de l'avatar",
    example: 'https://lh3.googleusercontent.com/a/default-user',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+237690000000',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
