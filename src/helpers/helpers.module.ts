import { Module } from '@nestjs/common';
import { StringsHelperService } from './services';
import { IdsHelperService } from './services';
import { EnvironmentHelperService } from './services/environment.helper.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    StringsHelperService,
    EnvironmentHelperService,
    IdsHelperService,
    EnvironmentHelperService,
  ],
  exports: [
    StringsHelperService,
    EnvironmentHelperService,
    IdsHelperService,
    EnvironmentHelperService,
  ],
})
export class HelpersModule {}
