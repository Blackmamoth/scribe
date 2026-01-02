import { env } from "@scribe/core/env";
import LOGGER from "@scribe/core/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	max: env.MAX_DB_CONNECTIONS,
	min: env.MIN_DB_CONNECTIONS,
	idleTimeoutMillis: env.IDLE_TIMEOUT_IN_SECONDS * 1000,
	connectionTimeoutMillis: env.CONNECTION_TIMEOUT_IN_SECONDS * 1000,
	keepAlive: true,
	allowExitOnIdle: true,
});

pool.on("connect", () => {
	LOGGER.info("application connected to postgres pool");
});

pool.on("remove", () => {
	LOGGER.warn("application disconnected from postgres pool");
});

pool.on("error", (error) => {
	LOGGER.error(error, "postgres pool error");
});

export const db = drizzle({
	client: pool,
	schema,
});

export { and, eq, gt, gte, inArray, ne, sql } from "drizzle-orm";
