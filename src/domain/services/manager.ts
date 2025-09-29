import { PlayerService } from '../capabilities/player-service';
import { PlayerNotFoundError } from '../exceptions/player-not-found-error';
import { Player } from '../models/player';
import type { PlayerRepositoryPort } from '../ports/player-repository.port';

export class PlayerServiceImpl implements PlayerService {
  constructor(private readonly repository: PlayerRepositoryPort) {}

  async getPlayer(id: string): Promise<Player> {
    const player = await this.repository.findById(id);

    if (!player) {
      throw new PlayerNotFoundError(`Player (id=${id}) Does Not Exist Error`);
    }

    return player;
  }

  async createPlayer(name: string, teamId: string): Promise<Player> {
    return await this.repository.create({ name, teamId });
  }

  async deletePlayer(id: string): Promise<void> {
    return await this.repository.deleteById(id);
  }

  async findByTeamId(teamId: string): Promise<Player[]> {
    return await this.repository.findByTeamId(teamId);
  }
}
