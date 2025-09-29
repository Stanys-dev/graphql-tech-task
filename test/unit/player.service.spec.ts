import Mocked = jest.Mocked;
import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;
import type { Player } from '../../src/domain/models/player';
import type { PlayerRepositoryPort } from '../../src/domain/ports/player-repository.port';
import { PlayerServiceImpl } from '../../src/domain/services/manager';

describe('PlayerService', () => {
  const repository: Mocked<PlayerRepositoryPort> = {
    create: fn(),
    findById: fn(),
    deleteById: fn(),
    findByTeamId: fn(),
  };

  const service = new PlayerServiceImpl(repository);

  afterEach(() => {
    resetAllMocks();
  });

  it('createPlayer -> calls repository.create and returns created player', async () => {
    // Arrange
    const input: Omit<Player, 'id'> = { name: 'Dovydas Giedraitis', teamId: 'Žalgiris' };
    const createdPlayer: Player = { id: 'p1', ...input };

    repository.create.mockResolvedValueOnce(createdPlayer);

    // Act
    const result = await service.createPlayer(input.name, input.teamId);

    // Assert
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(createdPlayer);
  });

  it('getPlayer -> returns player by ID', async () => {
    // Arrange
    const found: Player = { id: 'p1', name: 'Edgaras Ulanovas', teamId: 'Žalgiris' };
    repository.findById.mockResolvedValueOnce(found);

    // Act
    const result = await service.getPlayer(found.id);

    // Assert
    expect(repository.findById).toHaveBeenCalledWith(found.id);
    expect(result).toEqual(found);
  });

  it('deletePlayer -> delegates to repository', async () => {
    // Arrange
    const playerId = 'p1';
    repository.deleteById.mockResolvedValueOnce(undefined);

    // Act
    const result = await service.deletePlayer(playerId);

    // Assert
    expect(repository.deleteById).toHaveBeenCalledWith(playerId);
    expect(result).toBeUndefined();
  });

  it('findByTeamId -> returns players by team ID', async () => {
    // Arrange
    const teamId = 'Žalgiris';
    const found: Player[] = [
      { id: 'p1', name: 'Edgaras Ulanovas', teamId },
      { id: 'p2', name: 'Laurynas Žvėrutis', teamId },
    ];
    repository.findByTeamId.mockResolvedValueOnce(found);

    // Act
    const result = await service.findByTeamId(teamId);

    // Assert
    expect(repository.findByTeamId).toHaveBeenCalledWith(teamId);
    expect(result).toEqual(found);
  });
});
