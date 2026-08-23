// Dto/forgot-password.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'franckfotso276@gmail.com' })
  @IsEmail({}, { message: "L'adresse email doit être valide." })
  @IsNotEmpty({ message: "L'adresse email est requise." })
  email!: string;
}
