import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkoutTables1772000000001 implements MigrationInterface {
  name = "CreateWorkoutTables1772000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`workouts\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userUUID\` varchar(255) NOT NULL,
        \`date\` datetime NOT NULL,
        \`name\` varchar(255) NULL,
        \`notes\` text NULL,
        \`totalDuration\` int NOT NULL DEFAULT 0,
        \`caloriesBurned\` int NOT NULL DEFAULT 0,
        \`isCompleted\` tinyint NOT NULL DEFAULT 0,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`workout_exercises\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`workoutId\` int NOT NULL,
        \`exerciseId\` int NOT NULL,
        \`sets\` int NULL,
        \`reps\` int NULL,
        \`weight\` decimal(10,2) NULL,
        \`duration\` int NULL,
        \`distance\` decimal(10,2) NULL,
        \`notes\` text NULL,
        \`orderIndex\` int NOT NULL DEFAULT 0,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`workout_routines\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userUUID\` varchar(255) NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`scheduledDays\` text NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`isPreDefined\` tinyint NOT NULL DEFAULT 0,
        \`difficulty\` varchar(255) NULL,
        \`estimatedDuration\` int NULL,
        \`estimatedCalories\` int NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`workout_reminders\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userUUID\` varchar(255) NOT NULL,
        \`enabled\` tinyint NOT NULL DEFAULT 1,
        \`timeOfDay\` varchar(255) NULL,
        \`days\` text NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    const reminderIndex = await queryRunner.query(`
      SELECT COUNT(*) as count
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'workout_reminders'
        AND index_name = 'IDX_WORKOUT_REMINDER_USER_17654'
    `);
    if (Array.isArray(reminderIndex) && reminderIndex[0]?.count === 0) {
      await queryRunner.query(
        "CREATE UNIQUE INDEX `IDX_WORKOUT_REMINDER_USER_17654` ON `workout_reminders` (`userUUID`)",
      );
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`user_progress\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userUUID\` varchar(255) NOT NULL,
        \`date\` datetime NOT NULL,
        \`weight\` decimal(10,2) NULL,
        \`bodyFatPercentage\` decimal(10,2) NULL,
        \`muscleMass\` decimal(10,2) NULL,
        \`notes\` text NULL,
        \`measurements\` text NULL,
        \`photoUrl\` varchar(255) NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `user_progress`");
    await queryRunner.query("DROP TABLE IF EXISTS `workout_reminders`");
    await queryRunner.query("DROP TABLE IF EXISTS `workout_routines`");
    await queryRunner.query("DROP TABLE IF EXISTS `workout_exercises`");
    await queryRunner.query("DROP TABLE IF EXISTS `workouts`");
  }
}
