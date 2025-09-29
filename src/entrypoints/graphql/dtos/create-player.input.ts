import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

import type { Player } from '../../../domain/models/player';

@InputType()
export class CreatePlayerInput implements Omit<Player, 'id'> {
  @Field()
  @IsNotEmpty()
  name!: string;

  @Field(() => ID)
  @IsNotEmpty()
  teamId!: string;
}
