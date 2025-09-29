import { Migration } from '@mikro-orm/migrations';

export class Migration20250926074621 extends Migration {
  async up(): Promise<void> {
    this.addSql('create extension if not exists "uuid-ossp";');

    this.addSql(
      'create table "players" ("id" uuid not null default uuid_generate_v4(), "name" varchar(255) not null, "team_id" varchar(255) not null, "created_at" date not null, "updated_at" date not null, constraint "players_pkey" primary key ("id"));',
    );

    this.addSql('drop table if exists "player_entity" cascade;');
  }

  override async down(): Promise<void> {
    this.addSql(
      'create table "player_entity" ("id" varchar(255) not null default null, "name" varchar(255) not null default null, "team_id" varchar(255) not null default null, "created_at" timestamptz(0) not null default null, "updated_at" timestamptz(0) not null default null, constraint "player_entity_pkey" primary key ("id"));',
    );

    this.addSql('drop table if exists "players" cascade;');

    this.addSql('drop extension if exists "uuid-ossp"');
  }
}
