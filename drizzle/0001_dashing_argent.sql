CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`btcpay_invoice_id` text,
	`telegram_invoice_id` text,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`settled_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `promocodes` (
	`code` text PRIMARY KEY NOT NULL,
	`gives_days` integer NOT NULL,
	`uses_left` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `promocodes_users` (
	`code` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`code`) REFERENCES `promocodes`(`code`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `users` ADD `left_messages` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscription_ends_at` integer;