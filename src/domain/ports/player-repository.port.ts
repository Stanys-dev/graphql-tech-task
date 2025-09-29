import type { Player } from '../models/player';

export interface PlayerRepositoryPort {
  findById(id: string): Promise<Player | null>;
  findByTeamId(id: string): Promise<Player[]>;
  create(player: Omit<Player, 'id'>): Promise<Player>;
  deleteById(id: string): Promise<void>;
}
