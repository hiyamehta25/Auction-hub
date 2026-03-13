import { pgTable, text, serial, timestamp, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const auctionStatusEnum = pgEnum("auction_status", ["active", "ended", "cancelled"]);

export const auctionsTable = pgTable("auctions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).notNull(),
  currentPrice: numeric("current_price", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  endTime: timestamp("end_time").notNull(),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  status: auctionStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuctionSchema = createInsertSchema(auctionsTable).omit({ id: true, createdAt: true, status: true, currentPrice: true });
export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type Auction = typeof auctionsTable.$inferSelect;
