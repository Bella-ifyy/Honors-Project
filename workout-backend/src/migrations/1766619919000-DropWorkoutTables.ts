import { MigrationInterface, QueryRunner } from "typeorm";

export class DropWorkoutTables1766619919000 implements MigrationInterface {
  name = "DropWorkoutTables1766619919000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `workout_exercises`");
    await queryRunner.query("DROP TABLE IF EXISTS `workouts`");
    await queryRunner.query("DROP TABLE IF EXISTS `workout_routines`");
    await queryRunner.query("DROP TABLE IF EXISTS `workout_reminders`");
    await queryRunner.query("DROP TABLE IF EXISTS `user_progress`");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`workouts\` (
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
      CREATE TABLE \`workout_exercises\` (
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
      CREATE TABLE \`workout_routines\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userUUID\` varchar(255) NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`scheduledDays\` text NOT NULL DEFAULT '[]',
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
      CREATE TABLE \`workout_reminders\` (
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
    await queryRunner.query(
      "CREATE UNIQUE INDEX `IDX_WORKOUT_REMINDER_USER_17654` ON `workout_reminders` (`userUUID`)",
    );
    await queryRunner.query(`
      CREATE TABLE \`user_progress\` (
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
}
