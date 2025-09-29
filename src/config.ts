import { Options } from '@mikro-orm/core';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { registerAs } from '@nestjs/config';
import { Params } from 'nestjs-pino';
import pino from 'pino';

import { errorSerializer } from './infrastructure/logging/serializer';
import { Config } from './shared/constants/config.const';
import { ORM_CONTEXT } from './shared/constants/orm-context.const';
import { ENV } from './shared/enums/env.enum';

export type AppOptions = {
  readonly allowedOrigins?: string;

  readonly environment: ENV;

  readonly host: string;

  readonly port: number;

  readonly prefix: string;

  readonly name: string;

  readonly version: string;
};

const defaultAppOptions: AppOptions = {
  environment: ENV.DEV,

  host: '0.0.0.0',

  port: 4000,

  prefix: 'api',

  name: 'unknown',

  version: 'unknown',
};

export const CONFIG = {
  APP: registerAs<AppOptions>(Config.APP, (): AppOptions => {
    return {
      host: defaultAppOptions.host,
      port: Number(process.env.PORT) || 4000,
      prefix: process.env.APP_PREFIX || defaultAppOptions.prefix,
      version: process.env.APP_VERSION || defaultAppOptions.version,
      environment: (process.env.APP_ENV as ENV | undefined) || defaultAppOptions.environment,
      name: process.env.APP_NAME || defaultAppOptions.name,
    };
  }),

  LOGGER: registerAs<Params>(Config.LOGGER, (): Params => {
    const isProd = process.env.NODE_ENV?.trim()?.toUpperCase() === ENV.PROD;

    return {
      exclude: [],
      pinoHttp: {
        level: isProd ? 'error' : 'debug',
        wrapSerializers: true,
        serializers: {
          err: errorSerializer,
        },
        logger: pino({
          messageKey: 'message',
          timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
          formatters: {
            level: (level) => ({ level }),
          },
          base: {
            environment: process.env.APP_ENV || defaultAppOptions.environment,
            service: process.env.APP_NAME || defaultAppOptions.name,
          },
        }),
      },
    };
  }),

  DB: registerAs<Options<PostgreSqlDriver>>(Config.DB, () =>
    defineConfig({
      contextName: ORM_CONTEXT,
      clientUrl: process.env.DB_CLIENT_URL || 'postgresql://admin:admin@127.0.0.1:5432/mvp',
      entities: ['dist/infrastructure/persistence/entities/*.js'],
      debug: process.env.APP_ENV !== ENV.PROD,
      allowGlobalContext: false,
      forceUndefined: true,
    }),
  ),
};
