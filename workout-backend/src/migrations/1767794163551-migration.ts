import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1767794163551 implements MigrationInterface {
  name = "migration1767794163551";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`delegates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ownerUUID\` varchar(255) NOT NULL, \`delegateUUID\` varchar(255) NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`note_shares\` (\`id\` int NOT NULL AUTO_INCREMENT, \`noteId\` int NOT NULL, \`ownerUUID\` varchar(255) NOT NULL, \`delegateUUID\` varchar(255) NOT NULL, \`canEdit\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`task_shares\` (\`id\` int NOT NULL AUTO_INCREMENT, \`taskId\` int NOT NULL, \`ownerUUID\` varchar(255) NOT NULL, \`delegateUUID\` varchar(255) NOT NULL, \`canEdit\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notes\` ADD \`isPrivate\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tasks\` ADD \`isPrivate\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`isPrivate\``);
    await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`isPrivate\``);
    await queryRunner.query(`DROP TABLE \`task_shares\``);
    await queryRunner.query(`DROP TABLE \`note_shares\``);
    await queryRunner.query(`DROP TABLE \`delegates\``);
  }
}
