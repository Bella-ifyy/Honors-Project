import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLockPreferencesTable1733856001100
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "lock_preferences",
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
            isUnique: true,
          },
          { name: "appLockEnabled", type: "tinyint", default: 0 },
          { name: "diaryLockEnabled", type: "tinyint", default: 0 },
          { name: "tasksLockEnabled", type: "tinyint", default: 0 },
          { name: "notesLockEnabled", type: "tinyint", default: 0 },
          { name: "workoutsLockEnabled", type: "tinyint", default: 0 },
          { name: "requireBiometrics", type: "tinyint", default: 0 },
          { name: "diaryModuleEnabled", type: "tinyint", default: 0 },
          {
            name: "passwordHash",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          { name: "passwordUpdatedAt", type: "timestamp", isNullable: true },
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
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("lock_preferences");
  }
}
