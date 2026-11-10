import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { hashPassword } from '../src/auth/password.ts';
import { loadEnvFiles } from '../src/load-env.ts';

const users = [
  { username: 'admin', password: 'Ephphatha' },
  { username: 'kleavjames', password: 'asdf123!' },
] as const;

const client = new Client({ connectionString: databaseUrl() });

async function main(): Promise<void> {
  await client.connect();
  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    await client.query(
      `INSERT INTO users (id, username, "passwordHash", "updatedAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (username)
       DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "updatedAt" = NOW()`,
      [randomUUID(), user.username, passwordHash],
    );
  }
}

function databaseUrl(): string {
  loadEnvFiles();
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return connectionString;
}

try {
  await main();
} finally {
  await client.end();
}
