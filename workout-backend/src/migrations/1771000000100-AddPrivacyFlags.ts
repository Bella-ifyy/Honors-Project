import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrivacyFlags1771000000100 implements MigrationInterface {
  name = "AddPrivacyFlags1771000000100";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const notesHasPrivate = await queryRunner.hasColumn("notes", "isPrivate");
    if (!notesHasPrivate) {
      await queryRunner.query(
        "ALTER TABLE `notes` ADD `isPrivate` tinyint NOT NULL DEFAULT 0",
      );
    }
    const tasksHasPrivate = await queryRunner.hasColumn("tasks", "isPrivate");
    if (!tasksHasPrivate) {
      await queryRunner.query(
        "ALTER TABLE `tasks` ADD `isPrivate` tinyint NOT NULL DEFAULT 0",
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `tasks` DROP COLUMN `isPrivate`");
    await queryRunner.query("ALTER TABLE `notes` DROP COLUMN `isPrivate`");
  }
}
