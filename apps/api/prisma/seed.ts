import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

type GlcLevel = {
  level: number;
  name: string;
  title: string;
  description: string;
  books: {
    number: number;
    title: string;
    sessions: { number: number; title: string }[];
  }[];
};

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
  await seedGlc();
}

/** Upsert the shared curriculum. Does not create member progress or delete sessions. */
async function seedGlc(): Promise<void> {
  const path = join(dirname(fileURLToPath(import.meta.url)), './data/glc.json');
  const levels = JSON.parse(await readFile(path, 'utf8')) as GlcLevel[];

  for (const level of levels) {
    const glc = await client.query<{ id: string }>(
      `INSERT INTO glcs (id, level, name, title, description, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (level)
       DO UPDATE SET
         name = EXCLUDED.name,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         "updatedAt" = NOW()
       RETURNING id`,
      [randomUUID(), level.level, level.name, level.title, level.description],
    );
    const glcId = glc.rows[0]?.id;
    if (!glcId) {
      throw new Error(`GLC level ${level.level} was not saved`);
    }

    for (const book of level.books) {
      const saved = await client.query<{ id: string }>(
        `INSERT INTO glc_books (id, number, title, "glcId", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT ("glcId", number)
         DO UPDATE SET title = EXCLUDED.title, "updatedAt" = NOW()
         RETURNING id`,
        [randomUUID(), book.number, book.title, glcId],
      );
      const bookId = saved.rows[0]?.id;
      if (!bookId) {
        throw new Error(`GLC book ${book.number} was not saved`);
      }

      for (const session of book.sessions) {
        await client.query(
          `INSERT INTO glc_sessions (id, number, title, "bookId", "updatedAt")
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT ("bookId", number)
           DO UPDATE SET title = EXCLUDED.title, "updatedAt" = NOW()`,
          [randomUUID(), session.number, session.title, bookId],
        );
      }
    }
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
