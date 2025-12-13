import { env } from "@scribe/core/env";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, { schema });

export { and, eq, inArray } from "drizzle-orm";
