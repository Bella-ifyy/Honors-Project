import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkoutProfilesTable1772100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`workout_profiles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userUUID\` varchar(255) NOT NULL,
        \`age\` int NULL,
        \`gender\` varchar(32) NULL,
        \`heightCm\` decimal(5,2) NULL,
        \`weightKg\` decimal(5,2) NULL,
        \`bodyFatPercentage\` decimal(5,2) NULL,
        \`activityLevel\` varchar(64) NULL,
        \`experienceLevel\` varchar(64) NULL,
        \`primaryGoal\` varchar(64) NULL,
        \`weeklyWorkouts\` int NULL,
        \`sessionDurationMinutes\` int NULL,
        \`workoutTypes\` text NULL,
        \`targetAreas\` text NULL,
        \`equipmentAccess\` text NULL,
        \`injuries\` text NULL,
        \`medicalConditions\` text NULL,
        \`sleepHours\` decimal(4,2) NULL,
        \`stressLevel\` varchar(64) NULL,
        \`nutritionFocus\` varchar(64) NULL,
        \`hydrationLiters\` decimal(4,2) NULL,
        \`restingHeartRate\` int NULL,
        \`stepGoal\` int NULL,
        \`timezone\` varchar(64) NULL,
        \`units\` varchar(16) NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX \`IDX_WORKOUT_PROFILE_USER_17654\` (\`userUUID\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`workoutOnboardingCompleted\` tinyint NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      DROP COLUMN \`workoutOnboardingCompleted\`
    `);

    await queryRunner.query("DROP TABLE IF EXISTS `workout_profiles`");
  }
}
