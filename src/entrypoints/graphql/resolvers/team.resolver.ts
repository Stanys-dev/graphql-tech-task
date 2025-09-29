import { Inject } from '@nestjs/common';
import { Parent, ResolveField, Resolver, ResolveReference } from '@nestjs/graphql';

import type { PlayerService } from '../../../domain/capabilities/player-service';
import { INJECTION_TOKEN } from '../../../shared/constants/injection-token.const';
import { PlayerDto } from '../dtos/player.dto';
import { TeamResource } from '../federation/team.resource';

@Resolver(() => TeamResource)
export class TeamResolver {
  constructor(
    @Inject(INJECTION_TOKEN.PlayerService)
    private readonly playerService: PlayerService,
  ) {}

  @ResolveReference()
  resolveReference(ref: { __typename: string; id: string }): { id: string } {
    return { id: ref.id };
  }

  @ResolveField(() => [PlayerDto])
  async players(@Parent() team: TeamResource): Promise<PlayerDto[]> {
    return await this.playerService.findByTeamId(team.id);
  }
}
