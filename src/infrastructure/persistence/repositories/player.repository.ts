import { InjectEntityManager, InjectRepository } from '@mikro-orm/nestjs';
import { type EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import type { Player } from '../../../domain/models/player';
import type { PlayerRepositoryPort } from '../../../domain/ports/player-repository.port';
import { ORM_CONTEXT } from '../../../shared/constants/orm-context.const';
import { PlayerEntity } from '../entities/player.entity';

@Injectable()
export class PlayerRepository implements PlayerRepositoryPort {
  constructor(
    @InjectRepository(PlayerEntity, ORM_CONTEXT)
    private readonly repository: EntityRepository<PlayerEntity>,
    @InjectEntityManager(ORM_CONTEXT)
    private readonly entityManager: EntityManager,
  ) {}

  async create(player: Player): Promise<Player> {
    const playerEntity = this.repository.create({
      name: player.name,
      teamId: player.teamId,
    });

    await this.entityManager.persistAndFlush(playerEntity);

    return { id: playerEntity.id, name: playerEntity.name, teamId: playerEntity.teamId };
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.nativeDelete({ id });
  }

  async findById(id: string): Promise<Player | null> {
    const playerEntity = await this.repository.findOne({ id });

    return playerEntity ? { id: playerEntity.id, name: playerEntity.name, teamId: playerEntity.teamId } : null;
  }

  async findByTeamId(teamId: string): Promise<Player[]> {
    const playerEntities = await this.repository.find({ teamId });

    return playerEntities.map(({ createdAt: _c, updatedAt: _u, ...player }) => player);
  }
}
