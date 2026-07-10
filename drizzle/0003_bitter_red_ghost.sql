PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` integer NOT NULL,
	`left_messages` integer DEFAULT 0 NOT NULL,
	`subscription_ends_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "telegram_id", "left_messages", "subscription_ends_at", "created_at") SELECT "id", "telegram_id", "left_messages", "subscription_ends_at", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);--> statement-breakpoint
CREATE INDEX `users_telegram_id_idx` ON `users` (`telegram_id`);--> statement-breakpoint
-- One-time backfill: move the trial from a message-count limit to a 1-month time limit.
-- Existing users without unlimited access get a fresh free month starting from this migration's run date.
UPDATE `users`
SET `left_messages` = -1,
    `subscription_ends_at` = unixepoch(datetime('now', '+1 month'))
WHERE `left_messages` != -1;