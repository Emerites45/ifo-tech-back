import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/app/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleGuard } from './guards/google.guard';
import type { StringValue } from 'ms';
import { HelpersModule } from 'src/helpers/helpers.module';
import { RedisCacheModule } from 'src/common/cache/cache.module';
import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [
    HelpersModule,
    ConfigModule,
    UsersModule,
    MailModule,
    RedisCacheModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const expiresIn = (config.get<string>('JWT_EXPIRES_IN') ??
          '24h') as StringValue;

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GoogleGuard],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
