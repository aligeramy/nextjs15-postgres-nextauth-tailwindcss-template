import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({
  path: '.env.local',
});

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config; 