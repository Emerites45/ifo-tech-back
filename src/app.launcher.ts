/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// app.launcher.ts
// app.launcher.ts
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { EnvironmentHelperService } from './helpers/services/environment.helper.service';
import { HttpAdapterHost } from '@nestjs/core';
import { AppErrorsHandler } from './main/errors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as requestIp from 'request-ip';
import * as bodyParser from 'body-parser';

export class AppLauncher {
  baseUrl: string;
  version: string;
  suffix: string;
  swaggerPath: string;
  asyncApiPath: string;

  constructor(
    private readonly app: INestApplication,
    private readonly environmentHelper: EnvironmentHelperService,
    private readonly logger: Logger,
  ) {
    this.version = this.environmentHelper.getAppVersion();
    this.suffix = this.environmentHelper.getAppRouteSuffix();
    // Ex: "api/v1/public"
    this.baseUrl = this.environmentHelper.getAppRoutePrefix();
    this.swaggerPath = `documentation`;
    this.asyncApiPath = `events/documentation`;
  }

  public async setup(): Promise<void> {
    this.setupSizeUploadFile();
    this.setupCors();
    this.setupErrorHandler();

    // 1. Activer le préfixe global pour TOUTES les routes API
    this.setupGlobalPrefix();

    // 2. Configurer Swagger APRÈS le préfixe global
    this.setupSwagger();

    this.setupGlobalPipes();
    this.setupIpAddressMiddleware();
  }

  private setupGlobalPrefix(): void {
    // Exclure la route Swagger du préfixe global de NestJS
    this.app.setGlobalPrefix(this.baseUrl, {
      exclude: [this.swaggerPath, `${this.swaggerPath}/(.*)`],
    });
  }

  private setupSwagger(): void {
    const appName = this.environmentHelper.getAppName();

    const devUrl = this.environmentHelper.getApiUrlDev().replace(/\/$/, '');
    const stagingUrl = this.environmentHelper
      .getApiUrlStaging()
      .replace(/\/$/, '');
    const prodUrl = this.environmentHelper.getApiUrlProd().replace(/\/$/, '');

    const config = new DocumentBuilder()
      .setTitle(`${appName} API Documentation`)
      .setDescription(
        `This documentation provides all endpoint and entities of the ${appName} API.`,
      )
      .setVersion('1.0')
      // 💡 Astuce : On inclut manuellement la baseUrl DANS le serveur de Swagger.
      // Ainsi, le "Try it out" utilise la bonne URL sans multiplier le préfixe.
      .addServer(`${devUrl}`, 'For dev(local) environment')
      .addServer(
        `${cleanUrl(stagingUrl)}/${this.baseUrl}`,
        'For Staging environment',
      )
      .addServer(
        `${cleanUrl(prodUrl)}/${this.baseUrl}`,
        'For production environment',
      )
      .addSecurityRequirements('bearer')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Authentication Token',
        name: 'Authorization',
        in: 'header',
      })
      .build();

    const document = SwaggerModule.createDocument(this.app, config);

    // 💡 useGlobalPrefix: false garde l'interface accessible SANS préfixe
    SwaggerModule.setup(this.swaggerPath, this.app, document, {
      useGlobalPrefix: false,
    });
  }

  private setupCors(): void {
    this.app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
    });
  }

  private setupSizeUploadFile(): void {
    this.app.use(bodyParser.json({ limit: '150mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '1500mb', extended: true }));
  }

  private setupErrorHandler(): void {
    const httpAdapterHost = this.app.get<HttpAdapterHost>(HttpAdapterHost);
    this.app.useGlobalFilters(new AppErrorsHandler(httpAdapterHost));
  }

  private setupGlobalPipes(): void {
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true, // 👈 CETTE OPTION EST INDISPENSABLE pour convertir les strings form-data
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
  }

  private setupIpAddressMiddleware(): void {
    this.app.use(requestIp.mw({ attributeName: 'ipAddress' }));
  }

  public async launch(): Promise<void> {
    const port = this.environmentHelper.getAppPort();
    const appName = this.environmentHelper.getAppName();

    await this.app.listen(port, () => {
      this.logger.log(`Server ${appName} started on port ${port}`);
      this.logger.log(
        `Swagger UI: http://localhost:${port}/${this.swaggerPath}`,
      );
      this.logger.log(`API Base URL: http://localhost:${port}/${this.baseUrl}`);
    });
  }
}

function cleanUrl(url: string): string {
  return url ? url.replace(/\/$/, '') : '';
}
