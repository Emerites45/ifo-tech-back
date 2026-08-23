import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  videoId!: string;

  @IsInt()
  @Min(0)
  watchedSec!: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
