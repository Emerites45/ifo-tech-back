/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentHelperService {
  constructor(private readonly configService: ConfigService) {}

  // ============== Environment Configuration ==============
  get currentEnv(): 'dev' | 'staging' | 'prod' {
    return (this.configService.get<string>('NODE_ENV') || 'dev') as
      'dev' | 'staging' | 'prod';
  }

  isDev(): boolean {
    return this.currentEnv === 'dev';
  }

  isStaging(): boolean {
    return this.currentEnv === 'staging';
  }

  isProd(): boolean {
    return this.currentEnv === 'prod';
  }

  /**
   * Vérifie si l'application tourne en production
   */
  isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
  // ============== Application Configuration ==============
  getAppName(): string {
    return this.configService.getOrThrow<string>('APP_NAME');
  }

  getAppPort(): number {
    return this.configService.getOrThrow<number>('APP_PORT');
  }

  getAppVersion(): string {
    return this.configService.get<string>('APP_VERSION') || '1';
  }

  getAppRoutePrefix(): string {
    return this.configService.getOrThrow<string>('APP_ROUTE_PREFIX');
  }

  // ============== API URLs ==============
  getApiUrl(): string {
    const env = this.configService.getOrThrow<string>('NODE_ENV');

    const map = {
      production: 'API_URL_PROD',
      staging: 'API_URL_STAGING',
      development: 'API_URL_DEV',
      dev: 'API_URL_DEV',
      stage: 'API_URL_STAGING',
      prod: 'API_URL_PROD',
    };

    return this.configService.getOrThrow<string>(map[env]);
  }

  getApiUrlDev(): string {
    return this.configService.getOrThrow<string>('API_URL_DEV');
  }

  getApiUrlStaging(): string {
    return this.configService.getOrThrow<string>('API_URL_STAGING');
  }

  getApiUrlProd(): string {
    return this.configService.getOrThrow<string>('API_URL_PROD');
  }
  getAppRouteSuffix() {
    return this.configService.getOrThrow<string>('APP_ROUTE_SUFFIX');
  }

  getBaseApiUrl(): string {
    const version = this.getAppVersion();
    return `${this.getApiUrl()}/${this.getAppRoutePrefix()}/v${version}/${this.getAppRouteSuffix()}`;
  }

  // ============== Database Configuration ==============
  getPostgresHost(): string {
    return this.configService.getOrThrow<string>('POSTGRES_HOST');
  }

  getPostgresPort(): number {
    return parseInt(this.configService.getOrThrow<string>('POSTGRES_PORT'), 10);
  }

  getPostgresUser(): string {
    return this.configService.getOrThrow<string>('POSTGRES_USER');
  }

  getPostgresPassword(): string {
    return this.configService.getOrThrow<string>('POSTGRES_PASSWORD');
  }

  getPostgresDatabase(): string {
    return this.configService.getOrThrow<string>('POSTGRES_DB');
  }

  // ============== JWT Configuration ==============
  getJwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_AUTH_SECRET');
  }

  getJwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('JWT_AUTH_TIMELIVE');
  }

  getRefreshJwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('REFRESH_JWT_AUTH_TIMELIVE');
  }

  getRefreshJwtSecret(): string {
    return this.configService.getOrThrow<string>('REFRESH_JWT_AUTH_SECRET');
  }

  // ============== RabbitMQ Configuration ==============
  getRabbitMQHost(): string {
    return this.configService.getOrThrow<string>('RABBITMQ_HOST');
  }

  getRabbitMQPort(): number {
    return parseInt(this.configService.getOrThrow<string>('RABBITMQ_PORT'), 10);
  }

  getRabbitMQUser(): string {
    return this.configService.getOrThrow<string>('RABBITMQ_DEFAULT_USER');
  }

  // src/config/environment-helper.service.ts
  getGoogleClientId(): string {
    return this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
  }

  getGoogleClientSecret(): string {
    return this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
  }

  getGoogleCallbackUrl(): string {
    return this.configService.getOrThrow<string>('GOOGLE_CALLBACK_URL');
  }

  getRabbitMQPassword(): string {
    return this.configService.getOrThrow<string>('RABBITMQ_DEFAULT_PASS');
  }

  getRabbitMQUrl(): string {
    const host = this.getRabbitMQHost();
    const port = this.getRabbitMQPort();
    return `amqp://${host}:${port}`;
  }

  getPollingIntervalMs(): number {
    return parseInt(
      this.configService.getOrThrow<string>('POLLING_INTERVAL_MS'),
      10,
    );
  }

  isStreamingEnabled(): boolean {
    return this.configService.get<string>('STREAMING_ENABLED') === 'true';
  }

  // ============== Logging & Feature Flags ==============
  getLogLevel(): string {
    return this.configService.get<string>('LOG_LEVEL') || 'info';
  }

  isDatabaseLoggingEnabled(): boolean {
    return this.configService.get<string>('DATABASE_LOGGING') === 'true';
  }

  isDatabaseSynchronizeEnabled(): boolean {
    return this.configService.get<string>('DATABASE_SYNCHRONIZE') === 'true';
  }

  // ============== Mail Configuration ==============
  getMailHost(): string {
    return this.configService.getOrThrow<string>('MAIL_HOST');
  }

  getMailPort(): number {
    return (
      parseInt(this.configService.getOrThrow<string>('MAIL_PORT'), 10) || 587
    );
  }

  getMailSecure(): boolean {
    return this.configService.get<string>('MAIL_SECURE') === 'true';
  }

  getMailUser(): string {
    return this.configService.getOrThrow<string>('MAIL_USER');
  }

  getMailPass(): string {
    return this.configService.getOrThrow<string>('MAIL_PASS');
  }

  getMailFrom(): string {
    return this.configService.get<string>('MAIL_FROM') || 'noreply@example.com';
  }

  // ============== Redis Configuration ==============
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST') || 'localhost';
  }

  getRedisPort(): number {
    return parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10);
  }

  getRedisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  getRedisUrl(): string {
    return this.configService.getOrThrow<string>('REDIS_URL');
  }
  // ============== WebSocket Configuration ==============
  getWebSocketUrl(): string {
    const host =
      this.configService.get<string>('WEBSOCKET_HOST') || 'localhost';
    const port = this.getAppPort();
    const protocol = this.isProd() ? 'wss' : 'ws';
    return `${protocol}://${host}:${port}`;
  }

  // ============== Database / Neon Configuration ==============
  getDatabaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }
}
