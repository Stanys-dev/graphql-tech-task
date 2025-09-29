import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { RequestContext } from '@mikro-orm/core';
import { getMikroORMToken } from '@mikro-orm/nestjs';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, Params, PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AppOptions, CONFIG } from './config';
import { GraphQLPath } from './shared/constants/graphql.const';
import { ORM_CONTEXT } from './shared/constants/orm-context.const';
import { ENV } from './shared/enums/env.enum';

const logger = new Logger(new PinoLogger(CONFIG.LOGGER() as Params), {});

async function bootstrap(): Promise<void> {
  const options = CONFIG.APP() as AppOptions;

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: false }), {
    bufferLogs: true,
    abortOnError: process.env.NODE_ENV?.trim()?.toUpperCase() === ENV.PROD,
  });

  const isDev = options.environment === ENV.DEV;

  await app.register(cors, { origin: options.allowedOrigins || false });
  await app.register(
    helmet,
    isDev
      ? {
          contentSecurityPolicy: {
            directives: {
              ...helmet.contentSecurityPolicy.getDefaultDirectives(),
              'frame-src': [
                "'self'",
                'https://sandbox.embed.apollographql.com',
                'https://apollo-server-landing-page.cdn.apollographql.com',
              ],
              'script-src': [
                "'self'",
                "'unsafe-inline'",
                'https://embeddable-sandbox.cdn.apollographql.com',
                'https://sandbox.embed.apollographql.com',
                'https://apollo-server-landing-page.cdn.apollographql.com',
              ],
              'manifest-src': ["'self'", 'https://apollo-server-landing-page.cdn.apollographql.com'],
              'connect-src': ["'self'", 'http://localhost:4000', 'https://*.apollographql.com'],
              'img-src': ["'self'", 'data:', 'https://*.apollographql.com'],
              'worker-src': ["'self'", 'blob:'],
              'child-src': ["'self'", 'blob:'],
            },
          },
        }
      : undefined,
  );

  // graphql does not register route name globally so middleware never gets applied if it's not excluded
  app.setGlobalPrefix(options.prefix, { exclude: [GraphQLPath] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useLogger(logger);
  app.flushLogs();
  app.enableShutdownHooks();

  const orm = app.get(getMikroORMToken(ORM_CONTEXT));
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onRequest', (_req, _reply, done) => {
    RequestContext.create(orm.em, done);
  });

  await app.listen(options.port, options.host);

  process.once('unhandledRejection', (err) => {
    logger.error(err);
    app.close();

    process.exit(1);
  });

  process.once('uncaughtException', (err) => {
    logger.error(err);
    app.close();

    process.exit(1);
  });
}

void bootstrap().catch((error) => {
  logger.error(`${bootstrap.name}: failed`);
  logger.error(error);
  process.exit(1);
});
