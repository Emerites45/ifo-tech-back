/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { EnvironmentHelperService } from 'src/helpers/services/environment.helper.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly env: EnvironmentHelperService,
  ) {
    super({
      clientID: env.getGoogleClientId(),
      clientSecret: env.getGoogleClientSecret(),
      callbackURL: env.getGoogleCallbackUrl(),
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new InternalServerErrorException('Google profile has no email');
    }

    const user = await this.authService.findOrCreateGoogleUser({
      email,
      name: profile.displayName ?? '',
      avatar: profile.photos?.[0]?.value,
      googleId: profile.id,
    });

    const jwt = await this.authService.generateJwt(user);

    return {
      user,
      jwt,
      accessToken,
      refreshToken,
    };
  }
}
