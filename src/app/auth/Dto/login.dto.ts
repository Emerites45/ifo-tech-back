import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'john.doe@email.com',
  })
  @IsEmail({}, { message: 'email doit être une adresse valide' })
  @IsNotEmpty({ message: 'le email est obligatoire' })
  email!: string;

  @ApiProperty({
    description: 'Mot de passe de l utilisateur',
    example: 'secret1234',
  })
  @IsString({ message: 'le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'le mot de passe est obligatoire' })
  password!: string;
}
