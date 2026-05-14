import {
  Controller,
  Get,
  Put,
  Body,
  Headers,
  UseGuards,
  Param,
  Req,
} from "@nestjs/common";
import { ExpressRequest } from "../../types/expressRequest.interface";
import { NotificationPreferenceService } from "./notification-preference.service";
import { InboxService } from "./inbox.service";
import { AuthGuard } from "../../guards/auth.guard";

@Controller("notification")
export class NotificationController {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
    private readonly inboxService: InboxService,
  ) {}

  @Get("preferences")
  @UseGuards(AuthGuard)
  async getPreferences(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.notificationPreferenceService.getOrCreatePreferences(
      userUUID,
    );
  }

  @Put("preferences")
  @UseGuards(AuthGuard)
  async updatePreferences(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Body() updates: any,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.notificationPreferenceService.updatePreferences(
      userUUID,
      updates,
    );
  }

  @Get("inbox")
  @UseGuards(AuthGuard)
  async getInbox(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.inboxService.getMessages(userUUID);
  }

  @Put("inbox/:id/read")
  @UseGuards(AuthGuard)
  async markAsRead(
    @Req() req: ExpressRequest,
    @Param("id") messageId: number,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.inboxService.markAsRead(messageId, userUUID);
  }

  @Get("inbox/generate")
  @UseGuards(AuthGuard)
  async generateInsights(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    await this.inboxService.generateInsights(userUUID);
    return { message: "Insights generated successfully" };
  }
}
