import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

import { PlayerDto } from '../dtos/player.dto';

@ObjectType('Team')
@Directive('@extends')
@Directive('@key(fields: "id")')
export class TeamResource {
  @Field(() => ID)
  @Directive('@external')
  id!: string;

  @Field(() => [PlayerDto])
  players!: PlayerDto[];
}
