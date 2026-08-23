/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/app/users/users.service';

export interface JwtPayload {
  sub: string; // ID utilisateur sous format UUID (String)
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'votre_cle_secrete_fallback',
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // payload.sub est désormais traité comme un UUID de type string
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur non trouvé ou compte archivé',
      );
    }

    // CORRECTION : On extrait 'passwordHash' au lieu de 'password'
    const { passwordHash, ...result } = user;

    // Ce qui est retourné ici sera directement injecté dans req.user
    return result;
  }
}
