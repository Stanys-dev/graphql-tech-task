import Mocked = jest.Mocked;
import { afterEach } from 'node:test';

import { Test } from '@nestjs/testing';

import type { PlayerService } from '../../src/domain/capabilities/player-service';
import type { Player } from '../../src/domain/models/player';
import type { PlayerDto } from '../../src/entrypoints/graphql/dtos/player.dto';
import { PlayerResolver } from '../../src/entrypoints/graphql/resolvers/player.resolver';
import { INJECTION_TOKEN } from '../../src/shared/constants/injection-token.const';

import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;

describe('PlayerResolver', () => {
  const service: Mocked<PlayerService> = {
    createPlayer: fn(),
    getPlayer: fn(),
    deletePlayer: fn(),
    findByTeamId: fn(),
  };

  let resolver: PlayerResolver;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PlayerResolver, { provide: INJECTION_TOKEN.PlayerService, useValue: service }],
    }).compile();

    resolver = moduleRef.get(PlayerResolver);
  });

  afterEach(() => {
    resetAllMocks();
  });

  it('createPlayer -> mutation returns created DTO', async () => {
    // Arrange
    const input: Omit<Player, 'id'> = { name: 'Dovydas Giedraitis', teamId: 'Žalgiris' };
    const dto: PlayerDto = { id: 'p1', ...input };

    service.createPlayer.mockResolvedValueOnce(dto);

    // Act
    const result = await resolver.createPlayer(input);

    // Assert
    expect(service.createPlayer).toHaveBeenCalledWith(input.name, input.teamId);
    expect(result).toEqual(dto);
  });

  it('getPlayer -> query returns player DTO by ID', async () => {
    // Arrange
    const found: PlayerDto = { id: 'p1', name: 'Edgaras Ulanovas', teamId: 'Žalgiris' };
    service.getPlayer.mockResolvedValueOnce(found);

    // Act
    const result = await resolver.getPlayer({ id: found.id });

    // Assert
    expect(service.getPlayer).toHaveBeenCalledWith(found.id);
    expect(result).toEqual(found);
  });

  it('deletePlayer -> mutation returns true on success', async () => {
    // Arrange
    const playerId = 'p1';
    service.deletePlayer.mockResolvedValueOnce(undefined);

    // Act
    const result = await resolver.deletePlayer({ id: playerId });

    // Assert
    expect(service.deletePlayer).toHaveBeenCalledWith(playerId);
    expect(result).toBe(true);
  });
});
