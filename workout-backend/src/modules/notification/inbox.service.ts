import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, MoreThan } from "typeorm";
import { InboxMessageEntity } from "../../entities/inbox-message.entity";
import { TaskEntity } from "../../entities/task.entity";

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(InboxMessageEntity)
    private readonly inboxRepository: Repository<InboxMessageEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async getMessages(authUUID: string): Promise<InboxMessageEntity[]> {
    return await this.inboxRepository.find({
      where: { userUUID: authUUID },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(
    messageId: number,
    authUUID: string,
  ): Promise<InboxMessageEntity> {
    const message = await this.inboxRepository.findOne({
      where: { id: messageId, userUUID: authUUID },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    message.isRead = true;
    return await this.inboxRepository.save(message);
  }

  async generateInsights(authUUID: string): Promise<void> {
    // Get user's tasks
    const tasks = await this.taskRepository.find({
      where: { userUUID: authUUID },
    });

    if (tasks.length === 0) {
      return;
    }

    // Calculate completion rate
    const completedTasks = tasks.filter((t) => t.isCompleted);
    const completionRate = Math.round(
      (completedTasks.length / tasks.length) * 100,
    );

    // Check for streak
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCompletions = completedTasks.filter(
      (t) => new Date(t.updatedAt) > last7Days,
    );

    // Generate weekly summary if completion rate is good
    if (completionRate >= 70 && recentCompletions.length >= 5) {
      const existingSummary = await this.inboxRepository.findOne({
        where: {
          userUUID: authUUID,
          category: "Weekly Summary",
          createdAt: MoreThan(last7Days),
        },
      });

      if (!existingSummary) {
        await this.inboxRepository.save({
          userUUID: authUUID,
          icon: "chart-line",
          gradient: ["#11998E", "#38EF7D"],
          category: "Weekly Summary",
          title: `Excellent Week - ${completionRate}% Goal Complete`,
          message: `You completed ${completedTasks.length} out of ${tasks.length} tasks this week. You're on track to exceed your monthly goals!`,
          isRead: false,
        });
      }
    }

    // Check for streak milestone
    if (recentCompletions.length >= 7) {
      const existingStreak = await this.inboxRepository.findOne({
        where: {
          userUUID: authUUID,
          category: "Achievement",
          createdAt: MoreThan(last7Days),
        },
      });

      if (!existingStreak) {
        await this.inboxRepository.save({
          userUUID: authUUID,
          icon: "trophy",
          gradient: ["#FF6B35", "#F7931E"],
          category: "Achievement",
          title: "7-Day Streak Milestone! 🔥",
          message:
            "Congratulations! You've maintained a 7-day task completion streak. Keep the momentum going!",
          isRead: false,
        });
      }
    }

    // Analyze productivity patterns (peak hours)
    const tasksByHour = completedTasks.reduce((acc, task) => {
      const hour = new Date(task.updatedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(tasksByHour).sort(
      ([, a], [, b]) => b - a,
    )[0];

    if (peakHour && tasksByHour[peakHour[0]] >= 3) {
      const existingInsight = await this.inboxRepository.findOne({
        where: {
          userUUID: authUUID,
          category: "Productivity Insight",
          createdAt: MoreThan(last7Days),
        },
      });

      if (!existingInsight) {
        const startHour = parseInt(peakHour[0]);
        const endHour = startHour + 3;
        await this.inboxRepository.save({
          userUUID: authUUID,
          icon: "brain",
          gradient: ["#667EEA", "#764BA2"],
          category: "Productivity Insight",
          title: "Peak Performance Time Detected",
          message: `You complete most tasks between ${startHour}:00 - ${endHour}:00. Schedule important work during this window!`,
          isRead: false,
        });
      }
    }
  }
}
