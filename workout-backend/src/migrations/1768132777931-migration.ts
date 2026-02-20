import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1768132777931 implements MigrationInterface {
    name = 'migration1768132777931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if index exists before dropping
        const lockPrefsIndex = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'lock_preferences'
              AND index_name = 'UQ_d81f2001fd9e4f79d9081744270'
        `);
        if (Array.isArray(lockPrefsIndex) && lockPrefsIndex[0]?.count > 0) {
        await queryRunner.query(`DROP INDEX \`UQ_d81f2001fd9e4f79d9081744270\` ON \`lock_preferences\``);
        }

        const workoutProfileIndex = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'workout_profiles'
              AND index_name = 'IDX_WORKOUT_PROFILE_USER_17654'
        `);
        if (Array.isArray(workoutProfileIndex) && workoutProfileIndex[0]?.count > 0) {
        await queryRunner.query(`DROP INDEX \`IDX_WORKOUT_PROFILE_USER_17654\` ON \`workout_profiles\``);
        }

        await queryRunner.query(`ALTER TABLE \`lock_preferences\` ADD UNIQUE INDEX \`IDX_d81f2001fd9e4f79d908174427\` (\`userUUID\`)`);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` ADD \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` ADD \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`workout_exercises\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`workout_exercises\` ADD \`notes\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_reminders\` DROP COLUMN \`days\``);
        await queryRunner.query(`ALTER TABLE \`workout_reminders\` ADD \`days\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD \`notes\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP COLUMN \`measurements\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD \`measurements\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` DROP COLUMN \`scheduledDays\``);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` ADD \`scheduledDays\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`gender\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`gender\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`activityLevel\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`activityLevel\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`experienceLevel\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`experienceLevel\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`primaryGoal\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`primaryGoal\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`stressLevel\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`stressLevel\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`nutritionFocus\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`nutritionFocus\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`timezone\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`timezone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`units\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`units\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`updatedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`workouts\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`workouts\` ADD \`notes\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`workouts\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`workouts\` ADD \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`units\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`units\` varchar(16) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`timezone\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`timezone\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`nutritionFocus\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`nutritionFocus\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`stressLevel\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`stressLevel\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`primaryGoal\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`primaryGoal\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`experienceLevel\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`experienceLevel\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`activityLevel\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`activityLevel\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` DROP COLUMN \`gender\``);
        await queryRunner.query(`ALTER TABLE \`workout_profiles\` ADD \`gender\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` DROP COLUMN \`scheduledDays\``);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` ADD \`scheduledDays\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`workout_routines\` ADD \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP COLUMN \`measurements\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD \`measurements\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_reminders\` DROP COLUMN \`days\``);
        await queryRunner.query(`ALTER TABLE \`workout_reminders\` ADD \`days\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`workout_exercises\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`workout_exercises\` ADD \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` ADD \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`diary_entries\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`lock_preferences\` DROP INDEX \`IDX_d81f2001fd9e4f79d908174427\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_WORKOUT_PROFILE_USER_17654\` ON \`workout_profiles\` (\`userUUID\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_d81f2001fd9e4f79d9081744270\` ON \`lock_preferences\` (\`userUUID\`)`);
    }

}
