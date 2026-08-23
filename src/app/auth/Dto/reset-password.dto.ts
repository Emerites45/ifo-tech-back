// Dto/reset-password-token.dto.ts
import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordTokenDto {
  @ApiProperty({ description: "Le token JWT extrait de l'URL du mail" })
  @IsNotEmpty({ message: 'Le token est requis.' })
  token!: string;

  @ApiProperty({ example: 'NouveauMotDePasse123!' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis.' })
  newPassword!: string;
}
