/* eslint-disable @typescript-eslint/no-unsafe-call */
// main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 Import ajouté
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import { AppLauncher } from './app.launcher';
import { EnvironmentHelperService } from './helpers/services/environment.helper.service';
import { WinstonModule } from 'nest-winston';
import { InitializeLoggerInstance } from './main/logger';
import { join } from 'path';

async function bootstrap() {
  // Spécification explicite du type NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: InitializeLoggerInstance(),
    }),
  });

  // Exposition du dossier uploads à la racine du projet
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Sécurité des headers HTTP
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // Récupération des services nécessaires au Launcher
  const loggerService = app.get(Logger);
  const environmentHelper = app.get(EnvironmentHelperService);

  // Tout le setup et le démarrage sont délégués à l'AppLauncher
  const appLauncher = new AppLauncher(app, environmentHelper, loggerService);
  await appLauncher.setup();
  await appLauncher.launch();
}
bootstrap();
