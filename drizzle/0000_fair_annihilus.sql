CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` integer NOT NULL,
	`title` text,
	`type` text NOT NULL,
	`bot_status` text DEFAULT 'unblocked' NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`owner_id` text NOT NULL,
	`notion_database_id` text,
	`notion_workspace_id` text,
	`language_code` text DEFAULT 'en' NOT NULL,
	`only_mention_mode` integer DEFAULT false NOT NULL,
	`silent_mode` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`notion_database_id`) REFERENCES `notion_databases`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`notion_workspace_id`) REFERENCES `notion_workspaces`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chats_telegram_id_unique` ON `chats` (`telegram_id`);--> statement-breakpoint
CREATE INDEX `chats_telegram_id_idx` ON `chats` (`telegram_id`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`type` text DEFAULT 'file' NOT NULL,
	`extension` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `files_file_id_idx` ON `files` (`file_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`telegram_message_id` integer NOT NULL,
	`notion_page_id` text NOT NULL,
	`sent_at` integer NOT NULL,
	`sender_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_telegram_message_id_chat_id_idx` ON `messages` (`telegram_message_id`,`chat_id`);--> statement-breakpoint
CREATE TABLE `notion_databases` (
	`id` text PRIMARY KEY NOT NULL,
	`notion_workspace_id` text NOT NULL,
	`database_id` text NOT NULL,
	`title` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`notion_workspace_id`) REFERENCES `notion_workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notion_workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`name` text NOT NULL,
	`access_token` text NOT NULL,
	`workspace_id` text NOT NULL,
	`bot_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`key` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);--> statement-breakpoint
CREATE INDEX `users_telegram_id_idx` ON `users` (`telegram_id`);