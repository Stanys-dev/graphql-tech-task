import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { PlayerService } from '../../../domain/capabilities/player-service';
import { INJECTION_TOKEN } from '../../../shared/constants/injection-token.const';
import { CreatePlayerInput } from '../dtos/create-player.input';
import { DeletePlayerArgs } from '../dtos/delete-player.args';
import { GetPlayerArgs } from '../dtos/get-player.args';
import { PlayerDto } from '../dtos/player.dto';

@Resolver(() => PlayerDto)
export class PlayerResolver {
  constructor(
    @Inject(INJECTION_TOKEN.PlayerService)
    private readonly playerService: PlayerService,
  ) {}

  @Mutation(() => PlayerDto)
  async createPlayer(@Args('input') { name, teamId }: CreatePlayerInput): Promise<PlayerDto> {
    return await this.playerService.createPlayer(name, teamId);
  }

  @Mutation(() => Boolean)
  async deletePlayer(@Args() { id }: DeletePlayerArgs): Promise<boolean> {
    await this.playerService.deletePlayer(id);

    return true;
  }

  @Query(() => PlayerDto)
  async getPlayer(@Args() { id }: GetPlayerArgs): Promise<PlayerDto> {
    return await this.playerService.getPlayer(id);
  }
}
