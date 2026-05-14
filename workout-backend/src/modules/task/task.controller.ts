import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import {
  Body,
  Controller,
  Headers,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
} from "@nestjs/common";
import { TaskEntity } from "../../entities/task.entity";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "../../entities/task.dto";

@Controller("task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post("create")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: ExpressRequest,
  ): Promise<TaskEntity> {
    const userUUID = req.user?.uuid;
    if (!userUUID) {
      throw new UnauthorizedException("User context missing from request");
    }

    return await this.taskService.createTask(createTaskDto, userUUID);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTask(
    @Param("id") taskId: string,
    @Body() updateTaskDto: any,
    @Headers("authorization") authHeader: string,
    @Req() req: ExpressRequest,
  ): Promise<TaskEntity> {
    const userUUID = req.user?.uuid || authHeader;
    return await this.taskService.updateTask(taskId, updateTaskDto, userUUID);
  }

  @Get("dashboard/metrics")
  async dashboardMetrics(
    @Headers("authorization") authHeader: string,
  ): Promise<TaskEntity> {
    return await this.taskService.dashboardMetrics(authHeader);
  }

  @Get("dashboard/insights")
  @UseGuards(AuthGuard)
  async dashboardInsights(
    @Headers("authorization") authHeader: string,
  ): Promise<any> {
    return await this.taskService.getSmartInsights(authHeader);
  }

  @Get("task-manager/list")
  @UseGuards(AuthGuard)
  async taskManagerList(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ): Promise<TaskEntity> {
    const userUUID = req.user?.uuid || authHeader;
    return await this.taskService.taskManagerListByUser(userUUID);
  }

  @Get("send-reminder-notification")
  async sendReminderNotification(): Promise<TaskEntity[]> {
    return await this.taskService.sendReminderNotification();
  }

  @Get("send-daily-planning-reminder")
  async sendDailyPlanningReminder(): Promise<any[]> {
    return await this.taskService.sendDailyPlanningReminders();
  }

  @Get("send-evening-review-reminder")
  async sendEveningReviewReminder(): Promise<any[]> {
    return await this.taskService.sendEveningReviewReminders();
  }

  @Get("dashboard/graph")
  async dashboardGraph(
    @Headers("authorization") authHeader: string,
  ): Promise<TaskEntity> {
    return await this.taskService.dashboardGraph(authHeader);
  }

  @Get("dashboard/up-next")
  async dashboardUpNext(
    @Headers("authorization") authHeader: string,
  ): Promise<TaskEntity[]> {
    const result = await this.taskService.dashboardUpNext(authHeader);
    if (!Array.isArray(result)) {
      throw new Error("Expected an array of TaskEntity, but received a number");
    }
    return result;
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async deleteTask(
    @Param("id") taskId: string,
    @Headers("authorization") authHeader: string,
  ): Promise<{ message: string }> {
    return await this.taskService.deleteTask(taskId, authHeader);
  }

  @Get(":id/shares")
  @UseGuards(AuthGuard)
  async listShares(
    @Req() req: ExpressRequest,
    @Param("id") taskId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.taskService.listTaskShares(Number(taskId), userUUID);
  }

  @Get(":id/access")
  @UseGuards(AuthGuard)
  async getAccess(
    @Req() req: ExpressRequest,
    @Param("id") taskId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.taskService.getTaskAccess(Number(taskId), userUUID);
  }

  @Put(":id/shares")
  @UseGuards(AuthGuard)
  async updateShares(
    @Req() req: ExpressRequest,
    @Param("id") taskId: string,
    @Body()
    payload: { shares?: Array<{ delegateUUID: string; canEdit?: boolean }> },
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.taskService.updateTaskShares(
      Number(taskId),
      userUUID,
      payload?.shares ?? [],
    );
  }
}
