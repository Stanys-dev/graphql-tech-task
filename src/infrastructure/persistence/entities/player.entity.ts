import { DateType, Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'players' })
export class PlayerEntity {
  // Tell Mikro's TS types which fields are optional in create()
  [OptionalProps]?: 'id' | 'createdAt' | 'updatedAt';

  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  teamId!: string;

  @Property({ type: DateType, onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ type: DateType, onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;
}
