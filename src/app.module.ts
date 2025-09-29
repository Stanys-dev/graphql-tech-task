import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import type { Options } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ApolloFederationDriver, type ApolloFederationDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { LoggerModule, type Params } from 'nestjs-pino';

import { CONFIG } from './config';
import { PlayerServiceImpl } from './domain/services/manager';
import { TeamResource } from './entrypoints/graphql/federation/team.resource';
import { PlayerResolver } from './entrypoints/graphql/resolvers/player.resolver';
import { TeamResolver } from './entrypoints/graphql/resolvers/team.resolver';
import { factory } from './framework/provider';
import { HealthCheckModule } from './infrastructure/health-check/module';
import { PlayerEntity } from './infrastructure/persistence/entities/player.entity';
import { PlayerRepository } from './infrastructure/persistence/repositories/player.repository';
import { GraphQLPath } from './shared/constants/graphql.const';
import { INJECTION_TOKEN } from './shared/constants/injection-token.const';
import { ORM_CONTEXT } from './shared/constants/orm-context.const';
import { ENV } from './shared/enums/env.enum';

@Module({
  imports: [
    ConfigModule.forRoot({ load: Object.values(CONFIG), isGlobal: true }),
    MikroOrmModule.forRootAsync({
      contextName: ORM_CONTEXT,
      useFactory: () => {
        const isTest = process.env.NODE_ENV === ENV.TEST;

        return { ...(CONFIG.DB() as Options), registerRequestContext: false, allowGlobalContext: isTest };
      },
    }),
    MikroOrmModule.forFeature({ entities: [PlayerEntity], contextName: ORM_CONTEXT }),
    LoggerModule.forRoot(CONFIG.LOGGER() as Params),
    HealthCheckModule,
    GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: async (): Promise<ApolloFederationDriverConfig> => {
        const appConfig = await CONFIG.APP();
        const isDevelopment = appConfig.environment !== ENV.PROD;

        return {
          path: `/${GraphQLPath}`,
          playground: false,
          plugins: isDevelopment
            ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
            : [ApolloServerPluginLandingPageDisabled()],
          introspection: isDevelopment,
          includeStacktraceInErrorResponses: isDevelopment,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore: noImplicitAny
          context: ({ req }) => ({ req }),
          autoSchemaFile: { federation: 2 },
          sortSchema: true,
          buildSchemaOptions: {
            orphanedTypes: [TeamResource],
          },
        };
      },
    }),
  ],
  providers: [
    PlayerRepository,
    { provide: INJECTION_TOKEN.PlayerRepository, useExisting: PlayerRepository },
    factory(PlayerServiceImpl, [INJECTION_TOKEN.PlayerRepository]),
    { provide: INJECTION_TOKEN.PlayerService, useExisting: PlayerServiceImpl },
    factory(PlayerResolver, [INJECTION_TOKEN.PlayerService]),
    factory(TeamResolver, [INJECTION_TOKEN.PlayerService]),
  ],
})
export class AppModule {}
