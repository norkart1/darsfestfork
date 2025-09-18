import { pgTable, text, integer, timestamp, varchar, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: text("name").notNull(),
  darsname: text("darsname").notNull(),
  darsplace: text("darsplace"),
  zone: varchar("zone", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 100 }),
  category: varchar("category", { length: 20 }).notNull(),
  stage1: text("stage1"),
  stage2: text("stage2"),
  stage3: text("stage3"),
  groupstage1: text("groupstage1"),
  groupstage2: text("groupstage2"),
  groupstage3: text("groupstage3"),
  offstage1: text("offstage1"),
  offstage2: text("offstage2"),
  offstage3: text("offstage3"),
  groupoffstage: text("groupoffstage"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'stage', 'offstage', 'group'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const darsData = pgTable("dars_data", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  darsname: text("darsname").notNull(),
  darsplace: text("darsplace"),
  zone: varchar("zone", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 100 }),
  totalCandidates: integer("total_candidates").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueDarsZone: unique().on(table.darsname, table.zone)
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Add relations as needed
}));

export const candidatesRelations = relations(candidates, ({ one }) => ({
  // Add relations as needed
}));

export const programsRelations = relations(programs, ({ many }) => ({
  // Add relations as needed
}));

export const darsRelations = relations(darsData, ({ many }) => ({
  candidates: many(candidates),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;
export type DarsData = typeof darsData.$inferSelect;
export type InsertDarsData = typeof darsData.$inferInsert;