import { pgTable, uuid, text, integer, real, timestamp, date, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const roasters = pgTable(
  'roasters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    websiteUrl: text('website_url'),
    country: text('country'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('roasters_user_id_idx').on(table.userId)],
)

export const coffees = pgTable(
  'coffees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    roasterId: uuid('roaster_id')
      .notNull()
      .references(() => roasters.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    origin: text('origin'),
    variety: text('variety'),
    process: text('process'),
    priceCents: integer('price_cents'),
    weightG: integer('weight_g'),
    productUrl: text('product_url'),
    rating: real('rating'),
    tastingNotes: text('tasting_notes').array(),
    review: text('review'),
    purchasedAt: date('purchased_at'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('coffees_user_id_idx').on(table.userId),
    index('coffees_roaster_id_idx').on(table.roasterId),
  ],
)

export const roastersRelations = relations(roasters, ({ many }) => ({
  coffees: many(coffees),
}))

export const coffeesRelations = relations(coffees, ({ one }) => ({
  roaster: one(roasters, {
    fields: [coffees.roasterId],
    references: [roasters.id],
  }),
}))

export type Roaster = typeof roasters.$inferSelect
export type NewRoaster = typeof roasters.$inferInsert
export type Coffee = typeof coffees.$inferSelect
export type NewCoffee = typeof coffees.$inferInsert
