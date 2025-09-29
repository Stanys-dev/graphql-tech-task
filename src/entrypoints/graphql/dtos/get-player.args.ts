import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class GetPlayerArgs {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;
}
