import { loadEnvFiles } from "./src/load-env.ts";
import { defineConfig } from "prisma/config";

loadEnvFiles();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    // Direct connection. Prisma Migrate cannot use the pooled DATABASE_URL.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
