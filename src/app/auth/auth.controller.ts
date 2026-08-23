/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './Dto/register.dto';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './Dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GoogleGuard } from './guards/google.guard';
import { VerifyOtpDto } from './Dto/verify-otp.dto';
import { ResendOtpDto } from './Dto/resend-otp.dto';
import { ForgotPasswordDto } from './Dto/forgot-password.dto';
import { ResetPasswordTokenDto } from './Dto/reset-password.dto';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 3, ttl: 60 } }) // Plus restrictif pour éviter le brute force
  @Post('verify-otp')
  @HttpCode(HttpStatus.CREATED) // C'est ici que l'utilisateur est réellement créé
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.code);
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req) {
    console.log('Headers:', req.headers.authorization);
    return {
      message: 'voud etes connecter',
      user: req.user,
    };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleLogin() {
    // Passport redirige automatiquement vers Google
  }

  // auth.controller.ts

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Request() req: any, @Res() res: express.Response) {
    // 1. Passport a mis l'utilisateur trouvé/créé dans req.user
    // (via ta stratégie Google qu'on verra plus bas)
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=unauthorized`,
      );
    }

    // 2. Générer TON JWT Lumina pour cet utilisateur
    const jwt = this.authService.generateJwt({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // 3. Rediriger l'utilisateur vers Angular avec le token dans l'URL
    // On encode le nom au cas où il y ait des espaces ou caractères spéciaux
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-success?token=${jwt}`;

    return res.redirect(redirectUrl);
  }

  // ✅ Validate JWT (for frontend)
  @Get('validate')
  async validateToken(@Query('jwt') jwt: string) {
    const payload = await this.authService.validateJwt(jwt);
    return { valid: true, payload };
  }

  @Throttle({ default: { limit: 3, ttl: 60 } }) // Maximum 3 demandes de renvoi par minute
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordTokenDto: ResetPasswordTokenDto) {
    return this.authService.resetPasswordWithToken(resetPasswordTokenDto);
  }
}
