CREATE TABLE "coffees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roaster_id" uuid NOT NULL,
	"name" text NOT NULL,
	"origin" text,
	"variety" text,
	"process" text,
	"price_cents" integer,
	"weight_g" integer,
	"product_url" text,
	"rating" real,
	"tasting_notes" text[],
	"review" text,
	"purchased_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"country" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coffees" ADD CONSTRAINT "coffees_roaster_id_roasters_id_fk" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coffees_user_id_idx" ON "coffees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coffees_roaster_id_idx" ON "coffees" USING btree ("roaster_id");--> statement-breakpoint
CREATE INDEX "roasters_user_id_idx" ON "roasters" USING btree ("user_id");