import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1766619676548 implements MigrationInterface {
  name = "migration1766619676548";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exerciseIndex = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'exercise_favorites'
              AND index_name = 'IDX_EXERCISE_FAVORITE_USER_EXERCISE_17654'
        `);
    if (Array.isArray(exerciseIndex) && exerciseIndex[0]?.count > 0) {
      await queryRunner.query(
        `DROP INDEX \`IDX_EXERCISE_FAVORITE_USER_EXERCISE_17654\` ON \`exercise_favorites\``,
      );
    }

    const routineIndex = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'routine_favorites'
              AND index_name = 'IDX_ROUTINE_FAVORITE_USER_ROUTINE_17654'
        `);
    if (Array.isArray(routineIndex) && routineIndex[0]?.count > 0) {
      await queryRunner.query(
        `DROP INDEX \`IDX_ROUTINE_FAVORITE_USER_ROUTINE_17654\` ON \`routine_favorites\``,
      );
    }
    const workoutsLockColumn = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'lock_preferences'
              AND column_name = 'workoutsLockEnabled'
        `);
    if (Array.isArray(workoutsLockColumn) && workoutsLockColumn[0]?.count > 0) {
      await queryRunner.query(
        `ALTER TABLE \`lock_preferences\` DROP COLUMN \`workoutsLockEnabled\``,
      );
    }
    await queryRunner.query(
      `ALTER TABLE \`exercise_favorites\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exercise_favorites\` ADD \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`routine_favorites\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`routine_favorites\` ADD \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    const newExerciseIndex = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'exercise_favorites'
              AND index_name = 'IDX_fbf560ef379709aaee98f61c45'
        `);
    if (Array.isArray(newExerciseIndex) && newExerciseIndex[0]?.count === 0) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX \`IDX_fbf560ef379709aaee98f61c45\` ON \`exercise_favorites\` (\`userUUID\`, \`exerciseId\`)`,
      );
    }

    const newRoutineIndex = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'routine_favorites'
              AND index_name = 'IDX_3f7dc225e6274122e3f62d71e8'
        `);
    if (Array.isArray(newRoutineIndex) && newRoutineIndex[0]?.count === 0) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX \`IDX_3f7dc225e6274122e3f62d71e8\` ON \`routine_favorites\` (\`userUUID\`, \`routineId\`)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_3f7dc225e6274122e3f62d71e8\` ON \`routine_favorites\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fbf560ef379709aaee98f61c45\` ON \`exercise_favorites\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`routine_favorites\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`routine_favorites\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exercise_favorites\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exercise_favorites\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`lock_preferences\` ADD \`workoutsLockEnabled\` tinyint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_ROUTINE_FAVORITE_USER_ROUTINE_17654\` ON \`routine_favorites\` (\`userUUID\`, \`routineId\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_EXERCISE_FAVORITE_USER_EXERCISE_17654\` ON \`exercise_favorites\` (\`userUUID\`, \`exerciseId\`)`,
    );
  }
}
