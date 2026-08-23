/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/app/users/users.service';
import { RegisterDto } from './Dto/register.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from './strategies/jwt.strategy';
import { LoginDto } from './Dto/login.dto';
import { Role, User } from '@prisma/client';
import * as crypto from 'crypto';
import { MailService } from 'src/common/mail/mail.service';
import { CacheService } from 'src/common/cache/cache.service';
import { ResetPasswordTokenDto } from './Dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.savePendingRegistration(registerDto.email, otpCode, registerDto);

    // Utilisation de la méthode générique

    await this.mailService.send({
      to: registerDto.email,
      subject: '🚀 Activez votre compte Lumina',
      template: 'OTP', // 🔑 On utilise notre template OTP stylisé
      context: {
        otp: otpCode, // 🔑 Fournit directement le code au template
      },
    });

    return {
      message: 'Un code de vérification a été envoyé sur votre adresse email.',
    };
  }

  async verifyOtp(email: string, code: string) {
    const pendingData = await this.getPendingRegistration(email);

    if (!pendingData || pendingData.otpCode !== code) {
      throw new BadRequestException('Code OTP invalide ou expiré.');
    }

    const userToCreate = {
      ...pendingData.registerDto,
      role: pendingData.registerDto.role ?? Role.SUBSCRIBER,
    };

    // 1. Création de l'utilisateur en BDD
    const user = await this.usersService.create(userToCreate);

    // 2. Nettoyage du cache
    await this.deletePendingRegistration(email);

    // 3. ENVOI DE L'EMAIL DE BIENVENUE (Ajout ici)
    // On utilise le template 'WELCOME' configuré dans votre MailService
    await this.mailService
      .send({
        to: user.email,
        subject: '✨ Bienvenue sur Lumina ! Votre compte est activé',
        template: 'WELCOME',
        context: {
          name: user.name, // Passé au template pour faire "Bonjour Franck,"
        },
      })
      .catch((err) => {
        // Optionnel : on catch l'erreur pour éviter de bloquer la réponse de connexion
        // si l'envoi du mail de bienvenue échoue techniquement.
        console.error("Échec de l'envoi du mail de bienvenue", err);
      });

    // 4. Génération du token et retour de la réponse
    const token = this.generateToken(user.id, user.email);
    const { passwordHash, ...result } = user;

    return { user: result, access_token: token };
  }

  private async savePendingRegistration(
    email: string,
    otpCode: string,
    dto: RegisterDto,
  ) {
    const key = `otp:${email}`;
    const dataToStore = {
      otpCode,
      registerDto: dto,
    };

    // TTL de 10 minutes (10 * 60 * 1000 millisecondes)
    const TTL_10_MIN = 600000;

    await this.cacheService.set(key, dataToStore, TTL_10_MIN);
  }

  private async getPendingRegistration(email: string) {
    const key = `otp:${email}`;
    // On spécifie explicitement la structure attendue à la méthode .get<T>()
    return await this.cacheService.get<{
      otpCode: string;
      registerDto: RegisterDto;
    }>(key);
  }

  private async deletePendingRegistration(email: string) {
    const key = `otp:${email}`;
    await this.cacheService.delete(key);
  }

  private generateToken(id: string, email: string): string {
    const payload: JwtPayload = { sub: id, email };
    return this.jwtService.sign(payload);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Identifiants invalides.');
    }

    const isPasswordValid = await this.usersService.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Identifiants invalides.');
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash, ...result } = user;
    return { user: result, access_token: token };
  }

  async findOrCreateGoogleUser(googleProfile: {
    email: string;
    name: string;
    avatar?: string;
    googleId: string;
  }): Promise<User> {
    let user = await this.usersService.findOneByEmail(googleProfile.email);

    if (user) {
      if (!user.googleId) {
        user = await this.usersService.update(user.id, {
          googleId: googleProfile.googleId,
          avatar: user.avatar ?? googleProfile.avatar,
        });
      }
      return user;
    }

    const randomPassword = this.cryptoRandomPassword();

    return await this.usersService.create({
      email: googleProfile.email,
      fullName: googleProfile.name, // 💡 Ajout de fullName
      name: googleProfile.name, // 💡 Conservé pour compatibilité
      googleId: googleProfile.googleId,
      avatar: googleProfile.avatar ?? undefined,
      password: randomPassword,
      role: Role.SUBSCRIBER,
    });
  }

  generateJwt(user: { id: string; email: string; name?: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      provider: 'google',
    };

    const expiresIn = (process.env.JWT_EXPIRES_IN ??
      '7d') as JwtSignOptions['expiresIn'];

    return this.jwtService.sign(payload, {
      expiresIn,
    });
  }

  async validateJwt(token: string) {
    try {
      // 1. On décode d'abord sans vérifier pour voir à quel type de token on a affaire
      const decoded = this.jwtService.decode(token);

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Token malformé.');
      }

      // CAS UNIQUE : C'est un token de réinitialisation de mot de passe
      if (decoded.purpose === 'password-reset') {
        const user = await this.usersService.findOne(decoded.sub); // Ou findOne selon ton service
        if (!user) {
          throw new UnauthorizedException('Utilisateur introuvable.');
        }

        // On utilise le secret dynamique (avec le hash)
        const dynamicSecret = process.env.JWT_SECRET + user.passwordHash;
        return this.jwtService.verify(token, { secret: dynamicSecret });
      }

      // CAS GÉNÉRAL : C'est un token classique de connexion (ou autre)
      // On utilise le secret standard
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }
  }

  private cryptoRandomPassword(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // À rajouter dans auth.service.ts

  async resendOtp(email: string) {
    // 1. On cherche si des données d'inscription existent encore dans le cache
    const pendingData = await this.getPendingRegistration(email);

    if (!pendingData) {
      throw new BadRequestException(
        'Aucune inscription en cours ou session expirée. Veuillez vous réinscrire.',
      );
    }

    // 2. Générer un tout nouveau code OTP à 6 chiffres
    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Mettre à jour le cache avec le nouveau code, mais en gardant le registerDto d'origine
    await this.savePendingRegistration(
      email,
      newOtpCode,
      pendingData.registerDto,
    );

    // 4. Renvoyer le mail avec le nouveau code
    await this.mailService.send({
      to: email,
      subject: '🔄 Nouveau code de vérification - Lumina',
      template: 'OTP',
      context: {
        otp: newOtpCode,
      },
    });

    return {
      message:
        'Un nouveau code de vérification a été envoyé sur votre adresse email.',
    };
  }

  async forgotPassword(email: string) {
    // Récupère l'utilisateur actif par son email
    const user = await this.usersService.findOneByEmail(email);

    // Sécurité anti-énumération d'emails (on fait croire que tout s'est bien passé)
    if (!user) {
      return {
        message:
          'Si votre adresse email est valide, vous recevrez un lien de réinitialisation.',
      };
    }

    // On signe le token avec un secret éphémère basé sur le secret de base + le hash actuel de son mot de passe
    // Si l'utilisateur change son mot de passe, ce hash change et invalide automatiquement ce token JWT !
    const secret = process.env.JWT_SECRET + user.passwordHash;

    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password-reset' },
      { secret: secret, expiresIn: '15m' }, // Expire après 15 minutes
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?jwt=${resetToken}`;

    // On utilise le nouveau template 'RESET_PASSWORD'
    await this.mailService.send({
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe - Lumina',
      template: 'RESET_PASSWORD',
      context: {
        url: resetLink, // Fournit le lien au bouton du template HTML
      },
    });

    return {
      message:
        'Si votre adresse email est valide, vous recevrez un lien de réinitialisation.',
    };
  }

  async resetPasswordWithToken(resetDto: ResetPasswordTokenDto) {
    const { token, newPassword } = resetDto;

    // 1. On décode sans vérifier la signature d'abord pour extraire l'ID du user ('sub')
    const decoded = this.jwtService.decode(token);
    if (!decoded || decoded.purpose !== 'password-reset') {
      throw new BadRequestException('Lien de réinitialisation invalide.');
    }

    // 2. On récupère le user avec ta méthode findOne(id)
    const user = await this.usersService.findOne(decoded.sub);
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable.');
    }

    // 3. Maintenant on vérifie la signature du token avec son secret unique
    try {
      const secret = process.env.JWT_SECRET + user.passwordHash;
      this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new BadRequestException(
        'Le lien de réinitialisation a expiré ou est invalide.',
      );
    }

    // 4. Mise à jour via ton UsersService (qui gère déjà bcrypt.hash automatiquement !)
    await this.usersService.update(user.id, {
      password: newPassword,
    });

    return {
      success: true,
      message: 'Votre mot de passe a été modifié avec succès.',
    };
  }
}
