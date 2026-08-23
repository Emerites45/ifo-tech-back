// src/common/entities/base.entity.ts

export abstract class BaseEntity {
  id: string | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  deletedAt: Date | null | undefined;
  createdBy: string | null | undefined;
  updatedBy: string | null | undefined;
}
