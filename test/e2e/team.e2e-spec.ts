import type { IncomingMessage, ServerResponse } from 'node:http';

import { RequestContext } from '@mikro-orm/core';
import { getMikroORMToken } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import type { INestApplication } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import type { FastifyInstance, RawServerDefault } from 'fastify';
import request from 'supertest';

import { AppModule } from '../../src/app.module';
import type { PlayerDto } from '../../src/entrypoints/graphql/dtos/player.dto';
import { GraphQLPath } from '../../src/shared/constants/graphql.const';
import { ORM_CONTEXT } from '../../src/shared/constants/orm-context.const';

describe('TeamResolver (federation, e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), {
      bufferLogs: true,
      abortOnError: false,
    });
    await app.init();

    const fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>> = app
      .getHttpAdapter()
      .getInstance();
    fastify.addHook('onRequest', (_req, _reply, done) => {
      RequestContext.create(orm.em, done);
    });
    await fastify.ready();

    orm = app.get(getMikroORMToken(ORM_CONTEXT));

    const generator = orm.getSchemaGenerator();
    await generator.ensureDatabase();
    await orm.getMigrator().up();

    await orm.em.execute('TRUNCATE TABLE players RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await orm?.close(true);
    await app?.close();
  });

  const createPlayer = async (name: string, teamId: string) => {
    const mutation = `
      mutation Create($input: CreatePlayerInput!) {
        createPlayer(input: $input) { id name teamId }
      }
    `;
    const res = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({ query: mutation, variables: { input: { name, teamId } } });
    expect(res.status).toBe(200);
    expect(res.body?.data?.createPlayer).toBeTruthy();
    return res.body.data.createPlayer as { id: string; name: string; teamId: string };
  };

  const queryTeamPlayers = async (teamId: string) => {
    const query = `
      query TeamPlayers($reps: [_Any!]!) {
        _entities(representations: $reps) {
          ... on Team {
            players { id name teamId }
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({
        query,
        variables: { reps: [{ __typename: 'Team', id: teamId }] },
      });

    expect(res.status).toBe(200);
    return res.body;
  };

  it('returns players for the federated Team reference', async () => {
    // Arrange
    const teamId = 'Žalgiris';
    const otherTeam = 'Neptūnas';

    await createPlayer('Edgaras Ulanovas', teamId);
    await createPlayer('Laurynas Žvėrutis', teamId);
    await createPlayer('Mindaugas Girdžiūnas', otherTeam);

    // Act
    const body = await queryTeamPlayers(teamId);

    // Assert
    const players: PlayerDto[] = body?.data?._entities?.[0]?.players ?? [];
    expect(Array.isArray(players)).toBe(true);

    expect(players).toHaveLength(2);
    expect(players.map((p) => p.teamId)).toEqual(['Žalgiris', 'Žalgiris']);
    expect(players.map((p) => p.name)).toEqual(expect.arrayContaining(['Edgaras Ulanovas', 'Laurynas Žvėrutis']));
  });

  it('returns an empty list when team has no players', async () => {
    // Arrange
    const emptyTeamId = 'Lietkabelis';

    // Act
    const body = await queryTeamPlayers(emptyTeamId);

    // Assert
    const players = body?.data?._entities?.[0]?.players ?? [];
    expect(Array.isArray(players)).toBe(true);
    expect(players).toHaveLength(0);
  });
});
