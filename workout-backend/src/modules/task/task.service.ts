import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, getRepository, In, LessThan, Repository } from "typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { CreateTaskDto } from "../../entities/task.dto";
import { UserEntity } from "../../entities/user.entity";
import { NoteEntity } from "../../entities/note.entity";
import { TaskShareEntity } from "../../entities/task-share.entity";
import { DelegateEntity } from "../../entities/delegate.entity";
import { PushNotificationService } from "../auth/push-notification-service.service";
import { EmailNotificationService } from "../notification/email-notification.service";
import { NotificationPreferenceService } from "../notification/notification-preference.service";
import { AutoCategorizationService } from "../ai/auto-categorization.service";
import axios from "axios";

type InsightTone = "success" | "info" | "warning";
type InsightTrend = "up" | "down" | "neutral";

interface SmartInsight {
  id: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  tone: InsightTone;
  trend?: InsightTrend;
  tip?: string;
}

interface SmartInsightsResponse {
  generatedAt: string;
  hasInsights: boolean;
  insights: SmartInsight[];
  fallbackMessage?: string;
}

const TASK_ALERTS_CHANNEL_ID = "task-alerts";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    @InjectRepository(TaskShareEntity)
    private readonly taskShareRepository: Repository<TaskShareEntity>,
    @InjectRepository(DelegateEntity)
    private readonly delegateRepository: Repository<DelegateEntity>,
    private readonly pushNotification: PushNotificationService,
    private readonly emailNotification: EmailNotificationService,
    private readonly notificationPreference: NotificationPreferenceService,
    private readonly autoCategorizationService: AutoCategorizationService,
  ) {}

  private normalizeAuthUUID(authUUID: string): string {
    if (!authUUID) {
      return authUUID;
    }
    return authUUID.startsWith("Bearer ")
      ? authUUID.replace(/^Bearer\s+/i, "").trim()
      : authUUID;
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    userUUID: string,
  ): Promise<TaskEntity> {
    if (!userUUID) {
      throw new HttpException("User identifier missing", HttpStatus.UNAUTHORIZED);
    }

    const task = await this.buildTaskEntity(createTaskDto, userUUID);
    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new HttpException(
        "Failed to create log",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTaskFromIntegration(
    payload: Partial<CreateTaskDto>,
    userUUID: string,
    apiKeyId: number,
  ): Promise<TaskEntity> {
    if (!userUUID) {
      throw new HttpException("User identifier missing", HttpStatus.UNAUTHORIZED);
    }
    const task = await this.buildTaskEntity(payload, userUUID, apiKeyId);
    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new HttpException(
        "Failed to create log",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async buildTaskEntity(
    payload: Partial<CreateTaskDto>,
    userUUID: string,
    apiKeyId?: number,
  ): Promise<TaskEntity> {
    const task = new TaskEntity();
    task.title = payload.title;
    task.description = payload.description;
    task.dueDate = payload.dueDate ?? null;
    task.priority = payload.priority;
    task.isCompleted = payload.isCompleted ?? false;
    task.userUUID = userUUID;
    if (typeof payload.isPrivate === "boolean") {
      task.isPrivate = payload.isPrivate;
    }
    if (apiKeyId) {
      task.createdByApiKeyId = apiKeyId;
      task.createdVia = "api";
    }
    
    // Set category if provided, otherwise auto-categorize
    if (payload.category) {
      task.category = payload.category;
    } else {
      // Simple auto-categorization based on title keywords
      const title = (payload.title ?? "").toLowerCase();
      if (title.includes('work') || title.includes('meeting') || title.includes('office')) {
        task.category = 'Work';
      } else if (title.includes('health') || title.includes('exercise') || title.includes('doctor')) {
        task.category = 'Health';
      } else if (title.includes('learn') || title.includes('study') || title.includes('course')) {
        task.category = 'Learning';
      } else {
        task.category = 'Personal';
      }
    }
    if (task.dueDate) {
      axios
        .post("https://mono.specvista.com/platform-eng/api/v1/scheduler/action", {
          schedulerUUId: "aef911da-e944-4844-9861-4fadb0cfff5f",
          runtime: task.dueDate,
        })
        .catch((error) => {
          console.error("Failed to send scheduler request:", error);
        });
    }
    return task;
  }

  async updateTask(
    taskId: string,
    updateTaskDto: Partial<CreateTaskDto>, // Allow partial updates
    authUUID: string,
  ): Promise<TaskEntity> {
    try {
      const resolvedUUID =
        authUUID?.startsWith("Bearer ")
          ? authUUID.replace(/^Bearer\s+/i, "").trim()
          : authUUID;
      const numericId = Number(taskId);
      const idCondition = Number.isFinite(numericId) ? numericId : taskId;

      // Find the existing log by ID and userUUID for authorization
      const existingTask = await this.taskRepository.findOne({
        where: { id: idCondition as any },
      });

      if (!existingTask) {
        throw new HttpException(
          "Task not found or access denied",
          HttpStatus.NOT_FOUND,
        );
      }
      const canEdit = await this.canEditTask(existingTask, resolvedUUID);
      if (!canEdit) {
        throw new HttpException(
          "Task not found or access denied",
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the log properties from the DTO
      if (updateTaskDto.title !== undefined) {
        existingTask.title = updateTaskDto.title;
      }
      if (updateTaskDto.description !== undefined) {
        existingTask.description = updateTaskDto.description;
      }
      if (updateTaskDto.dueDate !== undefined) {
        existingTask.dueDate = updateTaskDto.dueDate;
        axios
          .post(
            "https://mono.specvista.com/platform-eng/api/v1/scheduler/action",
            {
              schedulerUUId: "aef911da-e944-4844-9861-4fadb0cfff5f",
              runtime: existingTask.dueDate,
            },
          )
          .catch((error) => {
            console.error("Failed to send scheduler request:", error);
          });
      }
      if (updateTaskDto.priority !== undefined) {
        existingTask.priority = updateTaskDto.priority;
      }
      if (updateTaskDto.isCompleted !== undefined) {
        existingTask.isCompleted = updateTaskDto.isCompleted;
      }
      if (updateTaskDto.category !== undefined) {
        existingTask.category = updateTaskDto.category;
      }
      if (
        typeof updateTaskDto.isPrivate === "boolean" &&
        existingTask.userUUID === resolvedUUID
      ) {
        existingTask.isPrivate = updateTaskDto.isPrivate;
      }

      // Save the updated log
      return await this.taskRepository.save(existingTask);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error("Failed to update task", error);
      throw new HttpException(
        "Failed to update log",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTaskById(taskId: string, authUUID: string): Promise<TaskEntity> {
    const resolvedUUID = this.normalizeAuthUUID(authUUID);
    const numericId = Number(taskId);
    const idCondition = Number.isFinite(numericId) ? numericId : taskId;
    const task = await this.taskRepository.findOne({
      where: { id: idCondition as any },
    });
    if (!task) {
      throw new HttpException(
        "Task not found or unauthorized",
        HttpStatus.NOT_FOUND,
      );
    }
    const canView = await this.canViewTask(task, resolvedUUID);
    if (!canView) {
      throw new HttpException(
        "Task not found or unauthorized",
        HttpStatus.NOT_FOUND,
      );
    }
    return task;
  }

  async taskManagerListByUser(userUUID: string): Promise<any> {
    try {
      const delegateLinks = await this.delegateRepository.find({
        where: { delegateUUID: userUUID },
      });
      const ownerUUIDs = delegateLinks.map(link => link.ownerUUID);

      const query = this.taskRepository
        .createQueryBuilder("task")
        .where("task.userUUID = :userUUID", { userUUID });

      if (ownerUUIDs.length) {
        query.orWhere("task.userUUID IN (:...ownerUUIDs) AND task.isPrivate = 0", {
          ownerUUIDs,
        });
      }

      const tasks = await query.orderBy("task.createdAt", "DESC").getMany();
      const taskOwnerUUIDs = Array.from(new Set(tasks.map(task => task.userUUID)));
      const owners = taskOwnerUUIDs.length
        ? await this.userRepository.find({ where: { uuid: In(taskOwnerUUIDs) } })
        : [];
      const ownerMap = new Map(
        owners.map(owner => [
          owner.uuid,
          {
            ownerName: `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim(),
            ownerEmail: owner.email,
          },
        ]),
      );

      const completedTasks = tasks.filter(task => task.isCompleted).length;
      const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

      // Return a single "default" project with all tasks
      return [{
        id: "default",
        name: "My Tasks",
        progress: parseFloat(progress.toFixed(2)),
        tasks: tasks.map((task) => ({
          id: task.id.toString(),
          time: task.dueDate
            ? new Date(task.dueDate).toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          title: task.title,
          description: task?.description || "",
          isCompleted: task?.isCompleted,
          priority: task?.priority,
          category: task?.category,
          isPrivate: task?.isPrivate ?? false,
          color: this.getColorForPriority(task.priority),
          participants: 1,
          userUUID: task.userUUID,
          ownerName: ownerMap.get(task.userUUID)?.ownerName || null,
          ownerEmail: ownerMap.get(task.userUUID)?.ownerEmail || null,
        })),
      }];
    } catch (error) {
      console.error("Error fetching task manager list:", error);
      throw new HttpException(
        "Failed to fetch task manager list",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getColorForPriority(priority: string): string {
    switch (priority.toLowerCase()) {
      case "high":
        return "#FF5E5E";
      case "medium":
        return "#FFD166";
      case "low":
        return "#06D6A0";
      default:
        return "#26547C";
    }
  }

  private isWithinReminderWindow(
    preferenceTime: string,
    now: Date,
    windowMinutes = 30,
  ): boolean {
    if (!preferenceTime) {
      return true;
    }

    const [hourString, minuteString] = preferenceTime.split(":");
    const hours = Number(hourString);
    const minutes = Number(minuteString);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return true;
    }

    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    const diffMs = Math.abs(now.getTime() - reminderTime.getTime());
    return diffMs <= windowMinutes * 60 * 1000;
  }

  private hasSentToday(lastSent: Date | null, now: Date): boolean {
    if (!lastSent) {
      return false;
    }

    return new Date(lastSent).toDateString() === now.toDateString();
  }

  private async calculateStreak(authUUID: string): Promise<number> {
    try {
      const userUUID = this.normalizeAuthUUID(authUUID);

      // Get all completed tasks for the user
      const completedTasks = await this.taskRepository.find({
        where: {
          userUUID,
          isCompleted: true,
        },
        order: { updatedAt: 'DESC' },
      });

      if (completedTasks.length === 0) {
        return 0;
      }

      // Group completed tasks by date
      const tasksByDate = new Map<string, any[]>();
      
      completedTasks.forEach(task => {
        if (task.updatedAt) {
          const dateKey = new Date(task.updatedAt).toDateString();
          if (!tasksByDate.has(dateKey)) {
            tasksByDate.set(dateKey, []);
          }
          tasksByDate.get(dateKey)!.push(task);
        }
      });

      // Calculate consecutive days
      let streak = 0;
      const today = new Date();
      const dates = Array.from(tasksByDate.keys()).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      // Check if user completed tasks today
      const todayKey = today.toDateString();
      let currentDate = today;

      // If no tasks completed today, start from yesterday
      if (!tasksByDate.has(todayKey)) {
        currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // Count consecutive days backwards
      while (true) {
        const dateKey = currentDate.toDateString();
        
        if (tasksByDate.has(dateKey)) {
          streak++;
          // Move to previous day
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          // No tasks completed on this day, streak ends
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }


  async getSmartInsights(authUUID: string): Promise<SmartInsightsResponse> {
    const userUUID = this.normalizeAuthUUID(authUUID);

    const now = new Date();
    const tasks = await this.taskRepository.find({
      where: { userUUID },
    });

    if (tasks.length === 0) {
      return {
        generatedAt: now.toISOString(),
        hasInsights: false,
        insights: [],
        fallbackMessage: "Add a few tasks to unlock personalised insights.",
      };
    }

    const toDate = (value?: Date | string | null): Date | null => {
      if (!value) {
        return null;
      }
      return value instanceof Date ? value : new Date(value);
    };

    const last14Days = new Date(now);
    last14Days.setDate(now.getDate() - 14);
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    const recentTasks = tasks.filter((task) => {
      const created = toDate(task.createdAt as Date | string | null);
      return created ? created >= last14Days : false;
    });

    if (recentTasks.length < 3) {
      return {
        generatedAt: now.toISOString(),
        hasInsights: false,
        insights: [],
        fallbackMessage:
          "Complete a few tasks this week to see smart insights tailored to you.",
      };
    }

    const tasksLast7 = recentTasks.filter((task) => {
      const created = toDate(task.createdAt as Date | string | null);
      return created ? created >= last7Days : false;
    });

    const tasksPrev7 = recentTasks.filter((task) => {
      const created = toDate(task.createdAt as Date | string | null);
      return created && created < last7Days;
    });

    const completedLast7 = tasksLast7.filter((task) => task.isCompleted).length;
    const completionRate =
      tasksLast7.length > 0
        ? Math.round((completedLast7 / tasksLast7.length) * 100)
        : null;

    const completedPrev7 = tasksPrev7.filter((task) => task.isCompleted).length;
    const previousRate =
      tasksPrev7.length > 0
        ? Math.round((completedPrev7 / tasksPrev7.length) * 100)
        : null;

    const trend: InsightTrend =
      completionRate === null || previousRate === null
        ? "neutral"
        : completionRate > previousRate
        ? "up"
        : completionRate < previousRate
        ? "down"
        : "neutral";

    const insights: SmartInsight[] = [];

    if (completionRate !== null) {
      insights.push({
        id: "weekly-momentum",
        title: "Weekly Momentum",
        description: `You completed ${completedLast7} of ${tasksLast7.length} tasks in the last 7 days.`,
        metricLabel: "Completion rate",
        metricValue: `${completionRate}%`,
        tone:
          completionRate >= 60
            ? "success"
            : completionRate >= 35
            ? "info"
            : "warning",
        trend,
        tip:
          completionRate >= 60
            ? "Protect those productive blocks—they're fueling your progress."
            : "Block 20 focused minutes each morning to clear two quick wins.",
      });
    }

    const categoryTotals = recentTasks.reduce<Record<string, number>>(
      (acc, task) => {
        const key = task.category?.trim() || "Personal";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    if (topCategory) {
      const [category, count] = topCategory;
      const share = Math.round((count / recentTasks.length) * 100);
      insights.push({
        id: "focus-balance",
        title: "Focus Spotlight",
        description: `Most of your recent tasks sit in ${category}.`,
        metricLabel: "Category share",
        metricValue: `${share}%`,
        tone: share >= 70 ? "warning" : "info",
        tip:
          share >= 70
            ? "Review other categories to be sure nothing important is slipping."
            : "Lean into this momentum—queue one next step in this area today.",
      });
    }

    const overdueCount = tasks.filter((task) => {
      const due = toDate(task.dueDate as Date | string | null);
      return due !== null && due < now && !task.isCompleted;
    }).length;

    if (overdueCount > 0) {
      insights.push({
        id: "overdue-hotspot",
        title: "Overdue Hotspot",
        description: `You have ${overdueCount} task${
          overdueCount === 1 ? "" : "s"
        } waiting past the due date.`,
        metricLabel: "Overdue tasks",
        metricValue: `${overdueCount}`,
        tone: "warning",
        tip: "Pick one overdue task and reschedule or finish it today to reset momentum.",
      });
    }

    const upcomingTask = tasks
      .filter((task) => {
        const due = toDate(task.dueDate as Date | string | null);
        return due !== null && due >= now && !task.isCompleted;
      })
      .sort((a, b) => {
        const dueA = toDate(a.dueDate as Date | string | null)!.getTime();
        const dueB = toDate(b.dueDate as Date | string | null)!.getTime();
        return dueA - dueB;
      })[0];

    if (upcomingTask && insights.length < 3) {
      const due = toDate(upcomingTask.dueDate as Date | string | null)!;
      const relativeFormatter = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
      });
      const diffInDays = Math.round(
        (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      insights.push({
        id: "up-next",
        title: "Next Focus",
        description: `“${upcomingTask.title}” is the next task on your schedule.`,
        metricLabel: "Due",
        metricValue:
          diffInDays === 0
            ? "Today"
            : relativeFormatter.format(diffInDays, "day"),
        tone: "info",
        tip: "Block time now so you can finish this before it becomes urgent.",
      });
    }

    return {
      generatedAt: now.toISOString(),
      hasInsights: insights.length > 0,
      insights,
      fallbackMessage:
        insights.length > 0
          ? undefined
          : "We're crunching the numbers—check back after a few more completed tasks.",
    };
  }

  async dashboardMetrics(authUUID: string): Promise<any> {
    const userUUID = this.normalizeAuthUUID(authUUID);

    // Get today's start and end date boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch tasks for the user
    const tasks = await this.taskRepository.find({
      where: {
        userUUID,
      },
    });

    // Filter tasks due today
    const dueToday = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) >= startOfDay &&
        new Date(task.dueDate) <= endOfDay,
    );

    // Calculate true streak
    const streak = await this.calculateStreak(userUUID);

    return {
      progress: tasks.filter((task) => !task.isCompleted).length,
      total: tasks.length,
      dueToday: dueToday.length,
      completed: tasks.filter((task) => task.isCompleted).length,
      streak: streak,
    };
  }

  async dashboardGraph(authUUID: string): Promise<any> {
    const userUUID = this.normalizeAuthUUID(authUUID);

    const tasks = await this.taskRepository.find({
      where: { userUUID },
    });

    const completedTasks = tasks.filter(
      (task) => task.isCompleted === true,
    ).length;
    const inProgressTasks = tasks.filter(
      (task) => task.isCompleted === false,
    ).length;
    const totalTasks = tasks.length;

    const data = [
      {
        value: inProgressTasks,
        svg: { fill: "#8665F4" }, // Progress color
        label: "Progress",
      },
      {
        value: completedTasks,
        svg: { fill: "#4CAF50" }, // Complete color
        label: "Complete",
      },
      {
        value: totalTasks,
        svg: { fill: "#FBC02D" }, // Total color
        label: "Total",
      },
    ];

    return data;
  }

  async dashboardUpNext(authUUID: string): Promise<TaskEntity[]> {
    const userUUID = this.normalizeAuthUUID(authUUID);

    const tasks = await this.taskRepository.find({
      where: { userUUID, isCompleted: 0 },
    });

    return (
      tasks
        .map((task) => {
          if (!task.dueDate) {
            return { ...task, deadlineScore: 0 };
          }

          const now = new Date();
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

          const score = Math.max(
            0,
            Math.min(100, 100 - (daysUntilDue / 14) * 100),
          );
          return { ...task, deadlineScore: Math.round(score) };
        })
        // Sort tasks by the deadline score in descending order (closest deadlines come first)
        .sort((a, b) => b.deadlineScore - a.deadlineScore)
        // Optionally, limit the results to the top N closest tasks (e.g., 5 tasks)
        .slice(0, 5)
    );
  }

  async upNext(): Promise<any> {
    const tasks = await this.taskRepository.find({
      where: { isCompleted: false },
    });

    return tasks
      .filter((task) => new Date(task.dueDate) > new Date())
      .slice(0, 3);
  }

  async sendDailyPlanningReminders(now: Date = new Date()) {
    const users = await this.userRepository.find();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const results: Array<{
      userUUID: string;
      sentPush: boolean;
      sentEmail: boolean;
      totalTasks: number;
      pendingTasks: number;
      notesCount: number;
    }> = [];

    for (const user of users) {
      try {
        const preferences =
          await this.notificationPreference.getOrCreatePreferences(user.uuid);

        if (!preferences.dailyPlanningPush && !preferences.dailyPlanningEmail) {
          continue;
        }

        if (this.hasSentToday(preferences.dailyPlanningLastSent, now)) {
          continue;
        }

        if (!this.isWithinReminderWindow(preferences.dailyPlanningTime, now)) {
          continue;
        }

        const tasksDueToday = await this.taskRepository.find({
          where: {
            userUUID: user.uuid,
            dueDate: Between(startOfDay, endOfDay),
          },
        });

        const pendingToday = tasksDueToday.filter((task) => !task.isCompleted);
        const pendingSummaries = pendingToday.slice(0, 5).map((task) => ({
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate,
          priority: task.priority,
        }));

        const notesCount = await this.noteRepository.count({
          where: { userUUID: user.uuid },
        });

        const totalTasks = tasksDueToday.length;
        const pendingCount = pendingToday.length;

        const planningMessage =
          pendingCount > 0
            ? `You have ${pendingCount} task${
                pendingCount === 1 ? "" : "s"
              } scheduled today.`
            : "You have no scheduled tasks today.";

        const noteMessage =
          notesCount > 0
            ? ` You also have ${notesCount} note${
                notesCount === 1 ? "" : "s"
              } saved—take a moment to review them.`
            : " Set aside a moment to capture your plans and notes.";

        let sentPush = false;
        let sentEmail = false;

        if (preferences.pushNotifications && preferences.dailyPlanningPush) {
          try {
            await this.pushNotification.sendNotification(
              "system",
              user.uuid,
              `[Morning Planning] ${planningMessage}${noteMessage}`,
              {
                channelId: TASK_ALERTS_CHANNEL_ID,
                data: {
                  notificationType: "dailyPlanning",
                  pendingTasks: pendingCount,
                  totalTasks,
                  notesCount,
                },
              },
            );
            sentPush = true;
          } catch (notificationError) {
            console.error(
              `Failed to send morning planning push for user ${user.uuid}:`,
              notificationError,
            );
          }
        }

        if (preferences.emailNotifications && preferences.dailyPlanningEmail) {
          try {
            await this.emailNotification.sendDailyPlanningEmail(user.email, {
              tasks: pendingSummaries,
              totalTasks,
              pendingTasks: pendingCount,
              notesCount,
            });
            sentEmail = true;
          } catch (emailError) {
            console.error(
              `Failed to send morning planning email for user ${user.uuid}:`,
              emailError,
            );
          }
        }

        if (sentPush || sentEmail) {
          await this.notificationPreference.updatePreferences(user.uuid, {
            dailyPlanningLastSent: now,
          });

          results.push({
            userUUID: user.uuid,
            sentPush,
            sentEmail,
            pendingTasks: pendingCount,
            totalTasks,
            notesCount,
          });
        }
      } catch (error) {
        console.error(
          `Failed to send daily planning reminder for user ${user.uuid}:`,
          error,
        );
      }
    }

    return results;
  }

  async sendEveningReviewReminders(now: Date = new Date()) {
    const users = await this.userRepository.find();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const results: Array<{
      userUUID: string;
      sentPush: boolean;
      sentEmail: boolean;
      pendingTasks: number;
      completedToday: number;
      overdueTasks: number;
    }> = [];

    for (const user of users) {
      try {
        const preferences =
          await this.notificationPreference.getOrCreatePreferences(user.uuid);

        if (!preferences.eveningReviewPush && !preferences.eveningReviewEmail) {
          continue;
        }

        if (this.hasSentToday(preferences.eveningReviewLastSent, now)) {
          continue;
        }

        if (!this.isWithinReminderWindow(preferences.eveningReviewTime, now)) {
          continue;
        }

        const tasksDueToday = await this.taskRepository.find({
          where: {
            userUUID: user.uuid,
            dueDate: Between(startOfDay, endOfDay),
          },
        });

        const pendingToday = tasksDueToday.filter((task) => !task.isCompleted);
        const completedToday = tasksDueToday.filter((task) => task.isCompleted);
        const overdueTasks = await this.taskRepository.find({
          where: {
            userUUID: user.uuid,
            isCompleted: false,
            dueDate: LessThan(startOfDay),
          },
        });

        const pendingCount = pendingToday.length;
        const completedCount = completedToday.length;
        const overdueCount = overdueTasks.length;

        const baseMessage =
          pendingCount > 0
            ? `You still have ${pendingCount} task${
                pendingCount === 1 ? "" : "s"
              } due today. Take a moment to wrap up or reschedule.`
            : "You’ve completed everything due today—great job!";

        const overdueMessage =
          overdueCount > 0
            ? ` ${overdueCount} overdue task${
                overdueCount === 1 ? " is" : "s are"
              } waiting for attention.`
            : "";

        const pendingSummaries = pendingToday.slice(0, 5).map((task) => ({
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate,
          priority: task.priority,
        }));

        let sentPush = false;
        let sentEmail = false;

        if (preferences.pushNotifications && preferences.eveningReviewPush) {
          try {
            await this.pushNotification.sendNotification(
              "system",
              user.uuid,
              `[Evening Review] ${baseMessage}${overdueMessage}`,
              {
                channelId: TASK_ALERTS_CHANNEL_ID,
                data: {
                  notificationType: "eveningReview",
                  pendingTasks: pendingCount,
                  completedToday: completedCount,
                  overdueTasks: overdueCount,
                },
              },
            );
            sentPush = true;
          } catch (notificationError) {
            console.error(
              `Failed to send evening review push for user ${user.uuid}:`,
              notificationError,
            );
          }
        }

        if (preferences.emailNotifications && preferences.eveningReviewEmail) {
          try {
            await this.emailNotification.sendEveningReviewEmail(user.email, {
              pendingTasks: pendingSummaries,
              pendingCount,
              completedCount,
              overdueCount,
            });
            sentEmail = true;
          } catch (emailError) {
            console.error(
              `Failed to send evening review email for user ${user.uuid}:`,
              emailError,
            );
          }
        }

        if (sentPush || sentEmail) {
          await this.notificationPreference.updatePreferences(user.uuid, {
            eveningReviewLastSent: now,
          });

          results.push({
            userUUID: user.uuid,
            sentPush,
            sentEmail,
            pendingTasks: pendingCount,
            completedToday: completedCount,
            overdueTasks: overdueCount,
          });
        }
      } catch (error) {
        console.error(
          `Failed to send evening review reminder for user ${user.uuid}:`,
          error,
        );
      }
    }

    return results;
  }

  async sendReminderNotification() {
    const taskRepository = getRepository(TaskEntity);
    const currentTime = new Date();

    // Get today's date at the start of the day (00:00:00)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Query tasks where dueDate is between todayStart and currentTime and reminderSent is false
    const tasksDueToday = await taskRepository
      .createQueryBuilder("task")
      .where("task.dueDate BETWEEN :todayStart AND :currentTime", {
        todayStart,
        currentTime,
      })
      .andWhere("task.reminderSent = :reminderSent", { reminderSent: false })
      .getMany();

    // Send notifications and update the reminderSent flag
    for (const task of tasksDueToday) {
      const user = await this.userRepository.findOne({
        where: { uuid: task.userUUID },
      });

      if (user) {
        // Check notification preferences
        const shouldSendPush =
          await this.notificationPreference.shouldSendPushNotification(
            task.userUUID,
          );
        const shouldSendEmail =
          await this.notificationPreference.shouldSendEmailNotification(
            task.userUUID,
          );

        // Send push notification
        if (shouldSendPush) {
          await this.pushNotification.sendNotification(
            "system",
            task.userUUID,
            `Reminder: ${task.title}`,
            {
              channelId: TASK_ALERTS_CHANNEL_ID,
              data: {
                notificationType: "taskReminder",
                taskId: task.id,
                dueDate: task.dueDate,
              },
            },
          );
        }

        // Send email notification
        if (shouldSendEmail) {
          await this.emailNotification.sendTaskReminderEmail(
            user.email,
            task.title,
            task.description || "",
            task.dueDate,
          );
        }
      }

      // Mark the reminder as sent
      task.reminderSent = true;
      await taskRepository.save(task);
    }

    return tasksDueToday;
  }

  // Delete a task
  async deleteTask(
    taskId: string,
    authUUID: string,
  ): Promise<{ message: string }> {
    const resolvedUUID = this.normalizeAuthUUID(authUUID);
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new HttpException(
        "Task not found or unauthorized",
        HttpStatus.NOT_FOUND,
      );
    }
    const canEdit = await this.canEditTask(task, resolvedUUID);
    if (!canEdit) {
      throw new HttpException(
        "Task not found or unauthorized",
        HttpStatus.NOT_FOUND,
      );
    }

    await this.taskShareRepository.delete({ taskId: Number(taskId) });
    await this.taskRepository.delete(taskId);
    return { message: "Task deleted successfully" };
  }

  // Delete all tasks for a user
  async deleteUserTasks(userUUID: string): Promise<void> {
    try {
      await this.taskRepository.delete({ userUUID });
      await this.taskShareRepository.delete({ ownerUUID: userUUID });
    } catch (error) {
      console.error('Error deleting user tasks:', error);
      throw error;
    }
  }

  async listTaskShares(taskId: number, ownerUUID: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userUUID: ownerUUID },
    });
    if (!task) {
      throw new HttpException(
        "Task not found or unauthorized",
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.taskShareRepository.find({
      where: { taskId, ownerUUID },
    });
  }

  async updateTaskShares(
    taskId: number,
    ownerUUID: string,
    shares: Array<{ delegateUUID: string; canEdit?: boolean }>,
  ) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userUUID: ownerUUID },
    });
    if (!task) {
      throw new HttpException(
        "Task not found or unauthorized",
        HttpStatus.NOT_FOUND,
      );
    }

    const delegates = await this.delegateRepository.find({
      where: { ownerUUID },
    });
    const allowed = new Set(delegates.map(delegate => delegate.delegateUUID));

    const normalized = shares
      .filter(share => allowed.has(share.delegateUUID))
      .reduce<Map<string, { delegateUUID: string; canEdit: boolean }>>(
        (acc, share) => {
          acc.set(share.delegateUUID, {
            delegateUUID: share.delegateUUID,
            canEdit: Boolean(share.canEdit),
          });
          return acc;
        },
        new Map(),
      );

    await this.taskShareRepository.delete({ taskId, ownerUUID });

    if (normalized.size > 0) {
      const newShares = Array.from(normalized.values()).map(share =>
        this.taskShareRepository.create({
          taskId,
          ownerUUID,
          delegateUUID: share.delegateUUID,
          canEdit: share.canEdit,
        }),
      );
      await this.taskShareRepository.save(newShares);
    }

    return await this.taskShareRepository.find({
      where: { taskId, ownerUUID },
    });
  }

  async getTaskAccess(taskId: number, userUUID: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new HttpException("Task not found", HttpStatus.NOT_FOUND);
    }
    const canView = await this.canViewTask(task, userUUID);
    if (!canView) {
      throw new HttpException("Task not found or unauthorized", HttpStatus.NOT_FOUND);
    }
    const isOwner = task.userUUID === userUUID;
    const canEdit = await this.canEditTask(task, userUUID);
    return { isOwner, canEdit, canView };
  }

  private async canViewTask(task: TaskEntity, userUUID: string): Promise<boolean> {
    if (task.userUUID === userUUID) {
      return true;
    }
    if (task.isPrivate) {
      return false;
    }
    const delegate = await this.delegateRepository.findOne({
      where: { ownerUUID: task.userUUID, delegateUUID: userUUID },
    });
    return Boolean(delegate);
  }

  private async canEditTask(task: TaskEntity, userUUID: string): Promise<boolean> {
    if (task.userUUID === userUUID) {
      return true;
    }
    if (task.isPrivate) {
      return false;
    }
    const delegate = await this.delegateRepository.findOne({
      where: { ownerUUID: task.userUUID, delegateUUID: userUUID },
    });
    return Boolean(delegate);
  }

}
