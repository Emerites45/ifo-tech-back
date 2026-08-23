// Dto/resend-otp.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    example: 'franckfotso276@gmail.com',
    description: "L'adresse email de l'utilisateur",
  })
  @IsEmail({}, { message: "L'adresse email doit être valide." })
  @IsNotEmpty({ message: "L'adresse email est requise." })
  email!: string;
}
