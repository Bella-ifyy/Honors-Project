import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1763821702754 implements MigrationInterface {
  name = "migration1763821702754";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notes\` ADD \`taskId\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`taskId\``);
  }
}
