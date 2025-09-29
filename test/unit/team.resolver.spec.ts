import Mocked = jest.Mocked;
import { afterEach } from 'node:test';

import { Test } from '@nestjs/testing';

import type { PlayerService } from '../../src/domain/capabilities/player-service';
import type { PlayerDto } from '../../src/entrypoints/graphql/dtos/player.dto';
import { TeamResolver } from '../../src/entrypoints/graphql/resolvers/team.resolver';
import { INJECTION_TOKEN } from '../../src/shared/constants/injection-token.const';

import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;

describe('TeamResolver (federation)', () => {
  const service: Mocked<PlayerService> = {
    createPlayer: fn(),
    getPlayer: fn(),
    deletePlayer: fn(),
    findByTeamId: fn(),
  };

  let resolver: TeamResolver;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TeamResolver, { provide: INJECTION_TOKEN.PlayerService, useValue: service }],
    }).compile();

    resolver = moduleRef.get(TeamResolver);
  });

  afterEach(() => {
    resetAllMocks();
  });

  it('players field returns players for the federated Team reference', async () => {
    // Arrange
    const teamId = 'Žalgiris';
    const teamRef = { __typename: 'Team', id: teamId };
    const players: PlayerDto[] = [
      { id: 'p1', name: 'Edgaras Ulanovas', teamId },
      { id: 'p2', name: 'Laurynas Žvėrutis', teamId },
    ];

    service.findByTeamId.mockResolvedValueOnce(players);

    // Act
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await resolver.players(teamRef as any);

    // Assert
    expect(service.findByTeamId).toHaveBeenCalledWith(teamId);
    expect(result).toEqual(players);
  });
});
