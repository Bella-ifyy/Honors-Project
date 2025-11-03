import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from "@nestjs/common";
import { ApiKeyGuard } from "../../guards/api-key.guard";
import { ApiKeyScopes } from "../../decorators/api-key-scopes.decorator";
import { ExpressRequest } from "../../types/expressRequest.interface";
import { NoteService } from "../note/note.service";
import { TaskService } from "../task/task.service";
import { IntegrationNoteDto } from "./dto/integration-note.dto";
import { IntegrationTaskDto } from "./dto/integration-task.dto";
import { PushNotificationService } from "../auth/push-notification-service.service";
import { NotificationPreferenceService } from "../notification/notification-preference.service";

@Controller("integrations")
@UseGuards(ApiKeyGuard)
export class IntegrationController {
  constructor(
    private readonly noteService: NoteService,
    private readonly taskService: TaskService,
    private readonly pushNotification: PushNotificationService,
    private readonly notificationPreference: NotificationPreferenceService,
  ) {}

  private async sendIntegrationNotification(
    userUUID: string,
    message: string,
    channelId: "general-alerts" | "task-alerts",
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      const preferences =
        await this.notificationPreference.getOrCreatePreferences(userUUID);
      if (!preferences.pushNotifications) {
        return;
      }
      await this.pushNotification.sendNotification("system", userUUID, message, {
        channelId,
        data: { source: "api", ...(data ?? {}) },
      });
    } catch (error) {
      console.warn("Integration push notification failed:", error);
    }
  }

  @Post("notes")
  @ApiKeyScopes("notes:write")
  @UsePipes(new ValidationPipe({ transform: true }))
  async createNote(@Req() req: ExpressRequest, @Body() body: IntegrationNoteDto) {
    const apiKey = req.apiKey;
    const note = await this.noteService.createNote(
      {
        ...body,
        createdByApiKeyId: apiKey.id,
        createdVia: "api",
      },
      apiKey.userUUID,
    );
    await this.sendIntegrationNotification(
      apiKey.userUUID,
      `New note created: ${note.title}`,
      "general-alerts",
      { entity: "note", action: "create", id: note.id },
    );
    return note;
  }

  @Put("notes/:id")
  @ApiKeyScopes("notes:write")
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateNote(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Body() body: Partial<IntegrationNoteDto>,
  ) {
    const apiKey = req.apiKey;
    const note = await this.noteService.updateNoteById(
      Number(id),
      body,
      apiKey.userUUID,
    );
    await this.sendIntegrationNotification(
      apiKey.userUUID,
      `Note updated: ${note.title}`,
      "general-alerts",
      { entity: "note", action: "update", id: note.id },
    );
    return note;
  }

  @Delete("notes/:id")
  @ApiKeyScopes("notes:write")
  async deleteNote(@Req() req: ExpressRequest, @Param("id") id: number) {
    const apiKey = req.apiKey;
    const note = await this.noteService.getNoteByIdForUser(
      Number(id),
      apiKey.userUUID,
    );
    if (note.createdByApiKeyId && note.createdByApiKeyId !== apiKey.id) {
      throw new ForbiddenException("Cannot delete notes created by other API keys");
    }
    const result = await this.noteService.deleteNoteById(
      Number(id),
      apiKey.userUUID,
    );
    await this.sendIntegrationNotification(
      apiKey.userUUID,
      `Note deleted: ${note.title}`,
      "general-alerts",
      { entity: "note", action: "delete", id: note.id },
    );
    return result;
  }

  @Post("tasks")
  @ApiKeyScopes("tasks:write")
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTask(@Req() req: ExpressRequest, @Body() body: IntegrationTaskDto) {
    const apiKey = req.apiKey;
    const task = await this.taskService.createTaskFromIntegration(
      body,
      apiKey.userUUID,
      apiKey.id,
    );
    await this.sendIntegrationNotification(
      apiKey.userUUID,
      `New task created: ${task.title}`,
      "task-alerts",
      { entity: "task", action: "create", id: task.id },
    );
    return task;
  }

  @Put("tasks/:id")
  @ApiKeyScopes("tasks:write")
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateTask(
    @Req() req: ExpressRequest,
    @Param("id") id: string,
    @Body() body: Partial<IntegrationTaskDto>,
  ) {
    const apiKey = req.apiKey;
    const task = await this.taskService.updateTask(
      String(id),
      body,
      apiKey.userUUID,
    );
    await this.sendIntegrationNotification(
      apiKey.userUUID,
      `Task updated: ${task.title}`,
      "task-alerts",
      { entity: "task", action: "update", id: task.id },
    );
    return task;
  }

  @Delete("tasks/:id")
  @ApiKeyScopes("tasks:write")
  async deleteTask(@Req() req: ExpressRequest, @Param("id") id: string) {
    const apiKey = req.apiKey;
    const task = await this.taskService.getTaskById(String(id), apiKey.userUUID);
    const result = await this.taskService.deleteTask(
      String(id),
      apiKey.userUUID,
    );
    await this.sendIntegrationNotification(
      apiKey.userUUID,
      `Task deleted: ${task.title}`,
      "task-alerts",
      { entity: "task", action: "delete", id: task.id },
    );
    return result;
  }
}
