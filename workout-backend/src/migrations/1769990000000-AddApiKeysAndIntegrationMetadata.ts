import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddApiKeysAndIntegrationMetadata1769990000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasApiKeysTable = await queryRunner.hasTable("api_keys");
    if (!hasApiKeysTable) {
      await queryRunner.createTable(
        new Table({
          name: "api_keys",
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            { name: "userUUID", type: "varchar", length: "255" },
            { name: "prefix", type: "varchar", length: "24" },
            { name: "keyHash", type: "varchar", length: "64" },
            { name: "name", type: "varchar", length: "255", default: "''" },
            { name: "scopes", type: "text", isNullable: true },
            {
              name: "createdAt",
              type: "datetime",
              default: "CURRENT_TIMESTAMP",
            },
            { name: "lastUsedAt", type: "datetime", isNullable: true },
            { name: "revokedAt", type: "datetime", isNullable: true },
          ],
        }),
      );
    }

    const notesHasCreatedBy = await queryRunner.hasColumn(
      "notes",
      "createdByApiKeyId",
    );
    if (!notesHasCreatedBy) {
      await queryRunner.addColumn(
        "notes",
        new TableColumn({
          name: "createdByApiKeyId",
          type: "int",
          isNullable: true,
        }),
      );
    }

    const notesHasCreatedVia = await queryRunner.hasColumn(
      "notes",
      "createdVia",
    );
    if (!notesHasCreatedVia) {
      await queryRunner.addColumn(
        "notes",
        new TableColumn({
          name: "createdVia",
          type: "varchar",
          length: "255",
          isNullable: true,
        }),
      );
    }

    const tasksHasCreatedBy = await queryRunner.hasColumn(
      "tasks",
      "createdByApiKeyId",
    );
    if (!tasksHasCreatedBy) {
      await queryRunner.addColumn(
        "tasks",
        new TableColumn({
          name: "createdByApiKeyId",
          type: "int",
          isNullable: true,
        }),
      );
    }

    const tasksHasCreatedVia = await queryRunner.hasColumn(
      "tasks",
      "createdVia",
    );
    if (!tasksHasCreatedVia) {
      await queryRunner.addColumn(
        "tasks",
        new TableColumn({
          name: "createdVia",
          type: "varchar",
          length: "255",
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("tasks", "createdVia");
    await queryRunner.dropColumn("tasks", "createdByApiKeyId");
    await queryRunner.dropColumn("notes", "createdVia");
    await queryRunner.dropColumn("notes", "createdByApiKeyId");
    await queryRunner.dropTable("api_keys");
  }
}
