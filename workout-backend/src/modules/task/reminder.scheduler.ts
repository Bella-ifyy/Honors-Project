import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TaskService } from "./task.service";

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(private readonly taskService: TaskService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleDailyPlanning(): Promise<void> {
    const results = await this.taskService.sendDailyPlanningReminders();

    if (results.length > 0) {
      this.logger.log(
        `Sent morning planning reminders for ${results.length} user(s)`,
      );
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEveningReview(): Promise<void> {
    const results = await this.taskService.sendEveningReviewReminders();

    if (results.length > 0) {
      this.logger.log(
        `Sent evening review reminders for ${results.length} user(s)`,
      );
    }
  }
}
