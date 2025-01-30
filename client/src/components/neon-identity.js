import { jsonb, pgSchema, text, timestamp } from '@/pg-core/index.js';
const neonIdentitySchema = pgSchema("neon_identity");
const usersSync = neonIdentitySchema.table("users_sync", {
  rawJson: jsonb("raw_json").notNull(),
  id: text().primaryKey().notNull(),
  name: text(),
  email: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" })
});
export {
  usersSync
};
//# sourceMappingURL=neon-identity.js.map