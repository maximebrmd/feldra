import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
export const user = pgTable("user", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}).enableRLS();
export const session = pgTable(
  "session",
  {
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_idx").on(table.userId)]
).enableRLS();
export const account = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("account_user_idx").on(table.userId),
    uniqueIndex("account_provider_idx").on(table.providerId, table.accountId),
  ]
).enableRLS();
export const verification = pgTable(
  "verification",
  {
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
).enableRLS();
export const rateLimit = pgTable("rate_limit", {
  count: integer("count").notNull(),
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
}).enableRLS();
export const profile = pgTable("profile", {
  onboardedAt: timestamp("onboarded_at"),
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
}).enableRLS();
// EXAMPLE RESOURCE: remove this table, lib/notes, /dashboard notes UI and /api/notes together.
export const note = pgTable(
  "note",
  {
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("note_user_idx").on(table.userId)]
).enableRLS();
export const billing = pgTable("billing", {
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  checkoutGeneration: integer("checkout_generation").notNull().default(0),
  checkoutId: text("checkout_id"),
  customerId: text("customer_id").unique(),
  periodEnd: timestamp("period_end"),
  priceId: text("price_id"),
  status: text("status").notNull().default("none"),
  subscriptionId: text("subscription_id"),
  syncedAt: timestamp("synced_at"),
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
}).enableRLS();
export const stripeEvent = pgTable("stripe_event", {
  id: text("id").primaryKey(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
  type: text("type").notNull(),
}).enableRLS();
