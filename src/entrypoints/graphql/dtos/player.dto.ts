import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { Player } from '../../../domain/models/player';

@ObjectType()
export class PlayerDto implements Player {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ID)
  teamId!: string;
}
