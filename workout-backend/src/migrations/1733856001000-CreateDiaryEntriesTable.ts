import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateDiaryEntriesTable1733856001000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "diary_entries",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "userUUID",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "content",
            type: "longtext",
            isNullable: false,
          },
          {
            name: "mood",
            type: "varchar",
            length: "32",
            isNullable: false,
            default: "'reflective'",
          },
          {
            name: "tags",
            type: "text",
            isNullable: true,
          },
          {
            name: "favorite",
            type: "tinyint",
            isNullable: false,
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("diary_entries");
  }
}
