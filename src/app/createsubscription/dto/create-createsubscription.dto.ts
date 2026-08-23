import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur souscrivant l'abonnement",
    example: 'usr_89f2a4b1-9c83-4a12-b912-3f8d7e6a5c4b',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: "Date d'expiration de l'abonnement au format ISO8601",
    example: '2027-08-23T23:59:59.000Z',
  })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    description: "Statut actuel de l'abonnement",
    enum: SubscriptionStatus,
    default: 'ACTIVE',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Note interne ou précision sur la souscription',
    example: 'Abonnement annuel accordé suite à une promotion.',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
