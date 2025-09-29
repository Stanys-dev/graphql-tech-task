import { Player } from '../models/player';

export interface PlayerService {
  getPlayer(id: string): Promise<Player>;

  createPlayer(name: string, teamId: string): Promise<Player>;

  deletePlayer(id: string): Promise<void>;

  findByTeamId(teamId: string): Promise<Player[]>;
}
