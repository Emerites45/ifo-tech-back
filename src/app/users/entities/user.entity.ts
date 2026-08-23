// src/modules/users/entities/user.entity.ts
import { User as PrismaUser, Role } from '@prisma/client';
import { BaseEntity } from 'src/common/entity/base.entity';

// 1. Ré-exportation des types Prisma pour le reste de l'application (votre code actuel)
export type { User as PrismaUserType } from '@prisma/client';
export { Role } from '@prisma/client';

// 2. Déclaration de la classe d'entité applicative qui hérite de BaseEntity
export class User
  extends BaseEntity
  implements
    Omit<
      PrismaUser,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'
    >
{
  name!: string;
  email!: string;
  passwordHash!: string;
  role!: Role;
  phoneNumber!: string | null;
  avatar!: string | null;
  googleId!: string | null;
}
