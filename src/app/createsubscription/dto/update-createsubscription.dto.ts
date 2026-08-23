import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-createsubscription.dto';

export class UpdateCreatesubscriptionDto extends PartialType(
  CreateSubscriptionDto,
) {}
