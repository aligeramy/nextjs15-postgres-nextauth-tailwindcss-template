import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { drizzle } from 'drizzle-orm/postgres-js';

config({
  path: '.env.local',
});

// biome-ignore lint: Forbidden non-null assertion.
const sql = postgres(process.env.POSTGRES_URL!);

const db = drizzle(sql);

async function main() {
  console.log('Migrating database...');
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  console.log('Migration complete');
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed');
  console.error(error);
  process.exit(1);
}); 