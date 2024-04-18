import {MigrationInterface, QueryRunner} from 'typeorm'

export class Migration1713442865423 implements MigrationInterface {
  name = 'Migration1713442865423'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "notion_workspace" DROP COLUMN "secretToken"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace"
            ADD "accessToken" character varying NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace"
            ADD "workspaceId" character varying NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace"
            ADD "botId" character varying NOT NULL
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_1109adfd5ac6061535baeddeea" ON "notion_workspace" ("workspaceId", "ownerId")
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1109adfd5ac6061535baeddeea"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace" DROP COLUMN "botId"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace" DROP COLUMN "workspaceId"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace" DROP COLUMN "accessToken"
        `)
    await queryRunner.query(`
            ALTER TABLE "notion_workspace"
            ADD "secretToken" character varying NOT NULL
        `)
  }
}
