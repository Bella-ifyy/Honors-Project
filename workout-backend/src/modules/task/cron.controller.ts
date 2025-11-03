import { Controller, Get } from "@nestjs/common";
import { TaskService } from "./task.service";

@Controller("cron")
export class CronController {
  constructor(private readonly taskService: TaskService) {}

  @Get("tick")
  async handleTick() {
    const [daily, evening, reminders] = await Promise.all([
      this.taskService.sendDailyPlanningReminders(),
      this.taskService.sendEveningReviewReminders(),
      this.taskService.sendReminderNotification(),
    ]);

    return {
      ok: true,
      dailyPlanningSent: daily.length,
      eveningReviewSent: evening.length,
      taskReminderSent: Array.isArray(reminders) ? reminders.length : reminders,
    };
  }
}
