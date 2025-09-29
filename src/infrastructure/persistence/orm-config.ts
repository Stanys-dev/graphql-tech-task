import { Options } from '@mikro-orm/core';

import { CONFIG } from '../../config';

type RootConfig = Omit<Options, 'migrations' | 'seeder'>;
type MigrationsConfig = Options['migrations'];

const ROOT_CONFIG: RootConfig = CONFIG.DB() as RootConfig;

const MIGRATIONS_CONFIG: MigrationsConfig = {
  tableName: 'migrations', // name of database table with log of executed transactions
  path: 'dist/infrastructure/persistence/migrations', // path to the folder with migrations
  transactional: true, // wrap each migration in a transaction
  disableForeignKeys: false, // wrap statements with `set foreign_key_checks = 0` or equivalent
  allOrNothing: true, // wrap all migrations in master transaction
  dropTables: true, // allow to disable table dropping
  safe: false, // allow to disable table and column dropping
  emit: 'ts', // migration generation mode
  snapshot: false, // Whether to use snapshot
};

const ORM_CONFIG: Options = {
  ...ROOT_CONFIG,
  migrations: MIGRATIONS_CONFIG,
};

// eslint-disable-next-line import/no-default-export
export default ORM_CONFIG;
