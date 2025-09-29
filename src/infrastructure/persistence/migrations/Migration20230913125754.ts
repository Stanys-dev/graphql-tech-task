import { Migration } from '@mikro-orm/migrations';

export class Migration20230913125754 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "player_entity" ("id" varchar(255) not null, "name" varchar(255) not null, "team_id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "player_entity_pkey" primary key ("id"));',
    );
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "player_entity" cascade;');
  }
}
