import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { hashPassword } from '../src/auth/password.ts';
import { loadEnvFiles } from '../src/load-env.ts';

const users = [
  { username: 'admin', password: 'Ephphatha' },
  { username: 'kleavjames', password: 'asdf123!' },
] as const;

const churchBranches = [
  {
    name: 'True North Church',
    branch: 'Davao',
    address:
      'Door 6 & 7, Camfer Building, 154 Bonifacio St, Poblacion District, Davao City, 8000 Davao del Sur',
  },
  {
    name: 'True North Kapalong',
    branch: 'Kapalong',
    address: 'Gabuyan, Kapalong, Davao del Norte',
  },
  {
    name: 'True North Tagum',
    branch: 'Tagum',
    address: 'Magugpo West, Tagum, Davao del Norte',
  },
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
  await client.query(
    `INSERT INTO roles (id, name, description, "updatedAt")
     VALUES ($1, 'Member', '', NOW())
     ON CONFLICT (name) DO NOTHING`,
    [randomUUID()],
  );
  for (const church of churchBranches) {
    await client.query(
      `INSERT INTO church_branches (id, name, branch, address, "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (name, branch)
       DO UPDATE SET address = EXCLUDED.address, "updatedAt" = NOW()`,
      [randomUUID(), church.name, church.branch, church.address],
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
