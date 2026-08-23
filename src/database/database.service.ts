/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// 🛑 Liste des modèles Prisma qui NE possèdent PAS le champ `deletedAt`
const MODELS_WITHOUT_SOFT_DELETE = ['Transaction'];

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public extendedClient: any;
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 25000,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });

    this.pool = pool;
    const rootClient = this;

    // Helper pour injecter le soft delete uniquement si le modèle le supporte
    const applySoftDeleteFilter = (model: string, args: any) => {
      if (MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
        return args;
      }
      args = args || {};
      args.where = { deletedAt: null, ...args.where };
      return args;
    };

    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async delete({ model, args }) {
            if (MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
              return (rootClient as any)[model].delete({ where: args.where });
            }
            return (rootClient as any)[model].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          },
          async deleteMany({ model, args }) {
            if (MODELS_WITHOUT_SOFT_DELETE.includes(model)) {
              return (rootClient as any)[model].deleteMany({
                where: args.where,
              });
            }
            return (rootClient as any)[model].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          },
          async findMany({ model, args }) {
            args = applySoftDeleteFilter(model, args);
            return (rootClient as any)[model].findMany(args);
          },
          async findFirst({ model, args }) {
            args = applySoftDeleteFilter(model, args);
            return (rootClient as any)[model].findFirst(args);
          },
          async findUnique({ model, args }) {
            args = applySoftDeleteFilter(model, args);
            return (rootClient as any)[model].findFirst(args);
          },
          async count({ model, args }) {
            args = applySoftDeleteFilter(model, args);
            return (rootClient as any)[model].count(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(
        '✅ Connexion réussie à PostgreSQL (via PrismaPg Adapter)',
      );
    } catch (error) {
      this.logger.error(
        '❌ Échec de la connexion initiale à la base de données',
        error,
      );
    }
  }

  async onModuleDestroy() {
    this.logger.warn('Fermeture des connexions à la base de données...');
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Pool Pg déconnecté avec succès.');
  }
}
