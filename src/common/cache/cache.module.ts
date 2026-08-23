/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/common/cache/cache.module.ts
// src/common/cache/cache.module.ts
// src/common/cache/cache.module.ts
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { CacheService } from './cache.service';
import { HelpersModule } from 'src/helpers/helpers.module';
import { EnvironmentHelperService } from 'src/helpers/services/environment.helper.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [HelpersModule],
      inject: [EnvironmentHelperService],
      useFactory: async (config: EnvironmentHelperService) => {
        const store = await redisStore({
          url: config.getRedisUrl(),
        });
        return { store };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class RedisCacheModule {}
