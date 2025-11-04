import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1768007816795 implements MigrationInterface {
    name = 'migration1768007816795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const columnExists = async (table: string, column: string) => {
            const result = await queryRunner.query(`
                SELECT COUNT(*) as count
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = '${table}'
                  AND column_name = '${column}'
            `);
            return Array.isArray(result) && result[0]?.count > 0;
        };

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`api_keys\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userUUID\` varchar(255) NOT NULL, \`prefix\` varchar(24) NOT NULL, \`keyHash\` varchar(64) NOT NULL, \`name\` varchar(255) NOT NULL DEFAULT '', \`scopes\` text NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`lastUsedAt\` datetime NULL, \`revokedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`delegates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ownerUUID\` varchar(255) NOT NULL, \`delegateUUID\` varchar(255) NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`diary_entries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userUUID\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` longtext NOT NULL, \`mood\` varchar(32) NOT NULL DEFAULT 'reflective', \`tags\` text NULL, \`favorite\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`lock_preferences\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userUUID\` varchar(255) NOT NULL, \`appLockEnabled\` tinyint NOT NULL DEFAULT 0, \`diaryLockEnabled\` tinyint NOT NULL DEFAULT 0, \`tasksLockEnabled\` tinyint NOT NULL DEFAULT 0, \`notesLockEnabled\` tinyint NOT NULL DEFAULT 0, \`requireBiometrics\` tinyint NOT NULL DEFAULT 0, \`diaryModuleEnabled\` tinyint NOT NULL DEFAULT 0, \`passwordHash\` varchar(255) NULL, \`passwordUpdatedAt\` timestamp NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_d81f2001fd9e4f79d908174427\` (\`userUUID\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`note_shares\` (\`id\` int NOT NULL AUTO_INCREMENT, \`noteId\` int NOT NULL, \`ownerUUID\` varchar(255) NOT NULL, \`delegateUUID\` varchar(255) NOT NULL, \`canEdit\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`task_shares\` (\`id\` int NOT NULL AUTO_INCREMENT, \`taskId\` int NOT NULL, \`ownerUUID\` varchar(255) NOT NULL, \`delegateUUID\` varchar(255) NOT NULL, \`canEdit\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        if (await columnExists('notes', 'project')) {
            await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`project\``);
        }
        if (await columnExists('notes', 'projectId')) {
            await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`projectId\``);
        }
        if (await columnExists('tasks', 'projectId')) {
            await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`projectId\``);
        }

        if (!(await columnExists('notes', 'isPrivate'))) {
            await queryRunner.query(`ALTER TABLE \`notes\` ADD \`isPrivate\` tinyint NOT NULL DEFAULT 0`);
        }
        if (!(await columnExists('notes', 'taskId'))) {
            await queryRunner.query(`ALTER TABLE \`notes\` ADD \`taskId\` int NULL`);
        }
        if (!(await columnExists('notes', 'createdByApiKeyId'))) {
            await queryRunner.query(`ALTER TABLE \`notes\` ADD \`createdByApiKeyId\` int NULL`);
        }
        if (!(await columnExists('notes', 'createdVia'))) {
            await queryRunner.query(`ALTER TABLE \`notes\` ADD \`createdVia\` varchar(255) NULL`);
        }

        if (!(await columnExists('notification_preferences', 'dailyPlanningPush'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`dailyPlanningPush\` tinyint NOT NULL DEFAULT 1`);
        }
        if (!(await columnExists('notification_preferences', 'dailyPlanningEmail'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`dailyPlanningEmail\` tinyint NOT NULL DEFAULT 1`);
        }
        if (!(await columnExists('notification_preferences', 'dailyPlanningTime'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`dailyPlanningTime\` varchar(255) NOT NULL DEFAULT '08:00'`);
        }
        if (!(await columnExists('notification_preferences', 'dailyPlanningLastSent'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`dailyPlanningLastSent\` datetime NULL`);
        }
        if (!(await columnExists('notification_preferences', 'eveningReviewPush'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`eveningReviewPush\` tinyint NOT NULL DEFAULT 1`);
        }
        if (!(await columnExists('notification_preferences', 'eveningReviewEmail'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`eveningReviewEmail\` tinyint NOT NULL DEFAULT 1`);
        }
        if (!(await columnExists('notification_preferences', 'eveningReviewTime'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`eveningReviewTime\` varchar(255) NOT NULL DEFAULT '20:00'`);
        }
        if (!(await columnExists('notification_preferences', 'eveningReviewLastSent'))) {
            await queryRunner.query(`ALTER TABLE \`notification_preferences\` ADD \`eveningReviewLastSent\` datetime NULL`);
        }

        if (!(await columnExists('tasks', 'category'))) {
            await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`category\` varchar(255) NULL`);
        }
        if (!(await columnExists('tasks', 'isPrivate'))) {
            await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`isPrivate\` tinyint NOT NULL DEFAULT 0`);
        }
        if (!(await columnExists('tasks', 'createdByApiKeyId'))) {
            await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`createdByApiKeyId\` int NULL`);
        }
        if (!(await columnExists('tasks', 'createdVia'))) {
            await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`createdVia\` varchar(255) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`createdVia\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`createdByApiKeyId\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`isPrivate\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`category\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`eveningReviewLastSent\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`eveningReviewTime\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`eveningReviewEmail\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`eveningReviewPush\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`dailyPlanningLastSent\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`dailyPlanningTime\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`dailyPlanningEmail\``);
        await queryRunner.query(`ALTER TABLE \`notification_preferences\` DROP COLUMN \`dailyPlanningPush\``);
        await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`createdVia\``);
        await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`createdByApiKeyId\``);
        await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`taskId\``);
        await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`isPrivate\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`projectId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notes\` ADD \`projectId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`notes\` ADD \`project\` varchar(255) NULL`);
        await queryRunner.query(`DROP TABLE \`task_shares\``);
        await queryRunner.query(`DROP TABLE \`note_shares\``);
        await queryRunner.query(`DROP INDEX \`IDX_d81f2001fd9e4f79d908174427\` ON \`lock_preferences\``);
        await queryRunner.query(`DROP TABLE \`lock_preferences\``);
        await queryRunner.query(`DROP TABLE \`diary_entries\``);
        await queryRunner.query(`DROP TABLE \`delegates\``);
        await queryRunner.query(`DROP TABLE \`api_keys\``);
    }

}
