/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/common/cache/cache.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error: any) {
      this.logger.error(
        `Erreur lors de l'écriture dans Redis [Key: ${key}]`,
        error?.stack,
      );
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.cacheManager.get<T>(key);
      return data ?? null;
    } catch (error: any) {
      this.logger.error(
        `Erreur lors de la lecture dans Redis [Key: ${key}]`,
        error?.stack,
      );
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error: any) {
      this.logger.error(
        `Erreur lors de la suppression dans Redis [Key: ${key}]`,
        error?.stack,
      );
    }
  }

  // --- AJOUTS : émulation d'un SET Redis (ex: "posts déjà vus par un utilisateur") ---
  async addToSet(key: string, member: string, ttl?: number): Promise<void> {
    try {
      const current = (await this.get<string[]>(key)) ?? [];
      if (!current.includes(member)) {
        current.push(member);
      }
      await this.set(key, current, ttl);
    } catch (error: any) {
      this.logger.error(`Erreur addToSet [Key: ${key}]`, error?.stack);
    }
  }

  async getSet(key: string): Promise<string[]> {
    return (await this.get<string[]>(key)) ?? [];
  }

  // --- AJOUTS : émulation d'un SORTED SET Redis (ex: score d'engagement par post) ---
  async incrementScore(
    key: string,
    member: string,
    amount: number,
  ): Promise<void> {
    try {
      const scores = (await this.get<Record<string, number>>(key)) ?? {};
      scores[member] = (scores[member] ?? 0) + amount;
      await this.set(key, scores); // pas de TTL — remis à zéro uniquement par le cron
    } catch (error: any) {
      this.logger.error(`Erreur incrementScore [Key: ${key}]`, error?.stack);
    }
  }

  async getTopScores(key: string, limit: number): Promise<string[]> {
    const scores = (await this.get<Record<string, number>>(key)) ?? {};
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);
  }
}
