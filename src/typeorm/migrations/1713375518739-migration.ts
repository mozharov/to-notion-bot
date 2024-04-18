import {MigrationInterface, QueryRunner} from 'typeorm'

export class Migration1713375518739 implements MigrationInterface {
  name = 'Migration1713375518739'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "telegramId" bigint NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_6758e6c1db84e6f7e711f8021f5" UNIQUE ("telegramId"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "notion_workspace" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."notion_workspace_status_enum" NOT NULL DEFAULT 'active',
                "name" character varying NOT NULL,
                "secretToken" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ownerId" uuid NOT NULL,
                CONSTRAINT "PK_d653cf15769694cae635483afdc" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "notion_database" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "databaseId" character varying NOT NULL,
                "title" character varying,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "chatId" uuid NOT NULL,
                "notionWorkspaceId" uuid NOT NULL,
                CONSTRAINT "REL_297947dd9ee5b28e16da7c9295" UNIQUE ("chatId"),
                CONSTRAINT "PK_761249395a2a9fe23c5f9c17edb" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "chat" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "telegramId" bigint NOT NULL,
                "title" character varying,
                "type" "public"."chat_type_enum" NOT NULL,
                "botStatus" "public"."chat_botstatus_enum" NOT NULL DEFAULT 'unblocked',
                "status" "public"."chat_status_enum" NOT NULL DEFAULT 'inactive',
                "languageCode" "public"."chat_languagecode_enum" NOT NULL DEFAULT 'en',
                "onlyMentionMode" boolean NOT NULL DEFAULT false,
                "silentMode" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ownerId" uuid NOT NULL,
                "notionDatabaseId" uuid,
                "notionWorkspaceId" uuid,
                CONSTRAINT "UQ_2494b953c01d5101e9942096596" UNIQUE ("telegramId"),
                CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "session" (
                "id" character varying NOT NULL,
                "data" jsonb,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "telegramMessageId" bigint NOT NULL,
                "notionPageId" character varying NOT NULL,
                "sentAt" bigint NOT NULL,
                "senderId" bigint NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "chatId" uuid NOT NULL,
                CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_7bfb8bf30c4ec0dbf4d5547d62" ON "message" ("telegramMessageId", "chatId")
        `)
    await queryRunner.query(`
            CREATE TABLE "file" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fileId" character varying NOT NULL,
                "type" "public"."file_type_enum" NOT NULL DEFAULT 'file',
                "extension" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "subscription" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "isActive" boolean NOT NULL DEFAULT true,
                "endsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "plan" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" "public"."plan_name_enum" NOT NULL,
                "cents" integer NOT NULL,
                "kopecks" integer NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8aa73af67fa634d33de9bf874ab" UNIQUE ("name"),
                CONSTRAINT "PK_54a2b686aed3b637654bf7ddbb3" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" integer NOT NULL,
                "currency" "public"."payment_currency_enum" NOT NULL,
                "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
                "type" "public"."payment_type_enum" NOT NULL,
                "walletOrderNumber" character varying,
                "walletOrderId" character varying,
                "moyNalogReceiptId" character varying,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "planId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "broadcasting" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "telegramMessageId" bigint NOT NULL,
                "telegramSenderId" bigint NOT NULL,
                "telegramUserId" bigint NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_50992b2622f19495f60748067e1" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "referral" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "referrerCode" character varying,
                "code" character varying NOT NULL,
                "launchesCount" integer NOT NULL DEFAULT '0',
                "monthsCount" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ownerId" uuid NOT NULL,
                CONSTRAINT "UQ_614bc7bce772214a17518410eab" UNIQUE ("code"),
                CONSTRAINT "REL_63710c0ebd6c49d069b7802c9d" UNIQUE ("ownerId"),
                CONSTRAINT "PK_a2d3e935a6591168066defec5ad" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "promocode" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying(100) NOT NULL,
                "freeDays" integer NOT NULL,
                "used" integer NOT NULL DEFAULT '0',
                "maxUses" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_ce3f2e33389d1c9d8661c33237f" UNIQUE ("code"),
                CONSTRAINT "PK_181c2c413dea9b3c725820e4dde" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "promocode_activation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                "promocodeId" uuid NOT NULL,
                CONSTRAINT "PK_19b1b28936837c6ffdc96d594f3" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace"
            ADD CONSTRAINT "FK_da32255e5d5e30cad06fdae671e" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_database"
            ADD CONSTRAINT "FK_297947dd9ee5b28e16da7c92951" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_database"
            ADD CONSTRAINT "FK_c4f0fec08ef7290e759fa2bacdd" FOREIGN KEY ("notionWorkspaceId") REFERENCES "notion_workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "chat"
            ADD CONSTRAINT "FK_ae88d8de23e69a0d57105a5bce5" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "chat"
            ADD CONSTRAINT "FK_2192f9e9eda49c49f0c65c9c235" FOREIGN KEY ("notionDatabaseId") REFERENCES "notion_database"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "chat"
            ADD CONSTRAINT "FK_fec11c7ea7c8b3a3c062f2b3a66" FOREIGN KEY ("notionWorkspaceId") REFERENCES "notion_workspace"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "subscription"
            ADD CONSTRAINT "FK_cc906b4bc892b048f1b654d2aa0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_fb6e13226928c7ddcf2e1bf6160" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_b046318e0b341a7f72110b75857" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "referral"
            ADD CONSTRAINT "FK_63710c0ebd6c49d069b7802c9dc" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "promocode_activation"
            ADD CONSTRAINT "FK_6a6b9cfa07379dbc0a906c3c09e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "promocode_activation"
            ADD CONSTRAINT "FK_77903a3631bfa589d9d5ff2d3df" FOREIGN KEY ("promocodeId") REFERENCES "promocode"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "promocode_activation" DROP CONSTRAINT "FK_77903a3631bfa589d9d5ff2d3df"
        `)
    await queryRunner.query(`
            ALTER TABLE "promocode_activation" DROP CONSTRAINT "FK_6a6b9cfa07379dbc0a906c3c09e"
        `)
    await queryRunner.query(`
            ALTER TABLE "referral" DROP CONSTRAINT "FK_63710c0ebd6c49d069b7802c9dc"
        `)
    await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_b046318e0b341a7f72110b75857"
        `)
    await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_fb6e13226928c7ddcf2e1bf6160"
        `)
    await queryRunner.query(`
            ALTER TABLE "subscription" DROP CONSTRAINT "FK_cc906b4bc892b048f1b654d2aa0"
        `)
    await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_619bc7b78eba833d2044153bacc"
        `)
    await queryRunner.query(`
            ALTER TABLE "chat" DROP CONSTRAINT "FK_fec11c7ea7c8b3a3c062f2b3a66"
        `)
    await queryRunner.query(`
            ALTER TABLE "chat" DROP CONSTRAINT "FK_2192f9e9eda49c49f0c65c9c235"
        `)
    await queryRunner.query(`
            ALTER TABLE "chat" DROP CONSTRAINT "FK_ae88d8de23e69a0d57105a5bce5"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_database" DROP CONSTRAINT "FK_c4f0fec08ef7290e759fa2bacdd"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_database" DROP CONSTRAINT "FK_297947dd9ee5b28e16da7c92951"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace" DROP CONSTRAINT "FK_da32255e5d5e30cad06fdae671e"
        `)
    await queryRunner.query(`
            DROP TABLE "promocode_activation"
        `)
    await queryRunner.query(`
            DROP TABLE "promocode"
        `)
    await queryRunner.query(`
            DROP TABLE "referral"
        `)
    await queryRunner.query(`
            DROP TABLE "broadcasting"
        `)
    await queryRunner.query(`
            DROP TABLE "payment"
        `)
    await queryRunner.query(`
            DROP TABLE "plan"
        `)
    await queryRunner.query(`
            DROP TABLE "subscription"
        `)
    await queryRunner.query(`
            DROP TABLE "file"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7bfb8bf30c4ec0dbf4d5547d62"
        `)
    await queryRunner.query(`
            DROP TABLE "message"
        `)
    await queryRunner.query(`
            DROP TABLE "session"
        `)
    await queryRunner.query(`
            DROP TABLE "chat"
        `)
    await queryRunner.query(`
            DROP TABLE "notion_database"
        `)
    await queryRunner.query(`
            DROP TABLE "notion_workspace"
        `)
    await queryRunner.query(`
            DROP TABLE "user"
        `)
  }
}
