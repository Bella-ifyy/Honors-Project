import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDelegatesAndShares1771000000000 implements MigrationInterface {
  name = "AddDelegatesAndShares1771000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const delegatesExists = await queryRunner.hasTable("delegates");
    if (!delegatesExists) {
      await queryRunner.query(
        "CREATE TABLE `delegates` (`id` int NOT NULL AUTO_INCREMENT, `ownerUUID` varchar(255) NOT NULL, `delegateUUID` varchar(255) NOT NULL, `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_delegates_owner_delegate` (`ownerUUID`, `delegateUUID`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
      );
    }

    const noteSharesExists = await queryRunner.hasTable("note_shares");
    if (!noteSharesExists) {
      await queryRunner.query(
        "CREATE TABLE `note_shares` (`id` int NOT NULL AUTO_INCREMENT, `noteId` int NOT NULL, `ownerUUID` varchar(255) NOT NULL, `delegateUUID` varchar(255) NOT NULL, `canEdit` tinyint NOT NULL DEFAULT 0, `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_note_shares_note_delegate` (`noteId`, `delegateUUID`), INDEX `IDX_note_shares_delegate` (`delegateUUID`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
      );
    }

    const taskSharesExists = await queryRunner.hasTable("task_shares");
    if (!taskSharesExists) {
      await queryRunner.query(
        "CREATE TABLE `task_shares` (`id` int NOT NULL AUTO_INCREMENT, `taskId` int NOT NULL, `ownerUUID` varchar(255) NOT NULL, `delegateUUID` varchar(255) NOT NULL, `canEdit` tinyint NOT NULL DEFAULT 0, `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_task_shares_task_delegate` (`taskId`, `delegateUUID`), INDEX `IDX_task_shares_delegate` (`delegateUUID`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `task_shares`");
    await queryRunner.query("DROP TABLE `note_shares`");
    await queryRunner.query("DROP TABLE `delegates`");
  }
}
