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
import { GraphQLPath } from '../../src/shared/constants/graphql.const';
import { ORM_CONTEXT } from '../../src/shared/constants/orm-context.const';

describe('PlayerResolver (e2e)', () => {
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

  it('creates a player and returns it', async () => {
    // Arrange
    const playerName = 'Edgaras Ulanovas';
    const teamId = 'Žalgiris';
    const createPlayerMutation = `
      mutation {
        createPlayer(input: { name: "${playerName}", teamId: "${teamId}" }) {
          id
          name
          teamId
        }
      }
    `;

    // Act
    const response = await request(app.getHttpServer()).post(`/${GraphQLPath}`).send({ query: createPlayerMutation });

    // Assert
    expect(response.status).toBe(200);
    const created = response.body?.data?.createPlayer;
    expect(created).toBeTruthy();
    expect(created.name).toBe(playerName);
    expect(created.teamId).toBe(teamId);
  });

  it('getPlayer -> returns player DTO by ID', async () => {
    // Arrange
    const playerName = 'Laurynas Birutis';
    const teamId = 'Žalgiris';
    const createPlayerMutation = `
      mutation {
        createPlayer(input: { name: "${playerName}", teamId: "${teamId}" }) {
          id
          name
          teamId
        }
      }
    `;

    const createResponse = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({ query: createPlayerMutation });

    expect(createResponse.status).toBe(200);
    const created = createResponse.body?.data?.createPlayer;
    expect(created).toBeTruthy();

    // Act
    const getQuery = `
     query Get($id: ID!) {
      getPlayer(id: $id) { id name teamId }
    }
  `;

    const getResponse = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({ query: getQuery, variables: { id: created.id } });

    // Assert
    expect(getResponse.status).toBe(200);
    const found = getResponse.body?.data?.getPlayer;
    expect(found).toEqual({ id: created.id, name: playerName, teamId });
  });

  it('deletePlayer -> returns true on success', async () => {
    // Arrange
    const name = 'Antanas Kavaliauskas';
    const teamId = 'Žalgiris';

    const createMutation = `
    mutation Create($name: String!, $teamId: ID!) {
      createPlayer(input: { name: $name, teamId: $teamId }) { id }
    }
  `;
    const createResponse = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({ query: createMutation, variables: { name, teamId } });

    const id = createResponse.body?.data?.createPlayer?.id;
    expect(id).toBeTruthy();

    // Act
    const deleteMutation = `
    mutation Delete($id: ID!) {
      deletePlayer(id: $id)
    }
  `;
    const deleteResponse = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({ query: deleteMutation, variables: { id } });

    // Assert
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body?.data?.deletePlayer).toBe(true);

    const getQuery = `
    query Get($id: ID!) { getPlayer(id: $id) { id } }
  `;

    const getResponse = await request(app.getHttpServer())
      .post(`/${GraphQLPath}`)
      .send({ query: getQuery, variables: { id } });

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.errors).toBeDefined();
    expect(Array.isArray(getResponse.body.errors)).toBe(true);
    expect(getResponse.body.errors[0].extensions.stacktrace[0]).toContain(`Does Not Exist`);
    expect(getResponse.body.data).toBeNull();
  });
});
