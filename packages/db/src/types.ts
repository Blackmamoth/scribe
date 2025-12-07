import type { InferSelectModel } from "drizzle-orm";
import type { brand } from "./schema/brand";

export interface Brand extends InferSelectModel<typeof brand> {}
