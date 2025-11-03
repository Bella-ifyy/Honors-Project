import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import { LockPreferenceService } from "./lock-preference.service";

const sanitizeHeader = (value?: string) =>
  value?.replace(/^Bearer\s+/i, "").trim();

const resolveUserUUID = (req: ExpressRequest, authHeader?: string) => {
  const fallback = sanitizeHeader(authHeader);
  return req.user?.uuid || fallback;
};

@Controller("locks")
@UseGuards(AuthGuard)
export class LockPreferenceController {
  constructor(private readonly lockPreferenceService: LockPreferenceService) {}

  @Get("/preferences")
  async getPreferences(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = resolveUserUUID(req, authHeader);
    if (!userUUID) {
      throw new BadRequestException("Unable to resolve user");
    }

    const preference = await this.lockPreferenceService.getOrCreate(userUUID);
    const { passwordHash, ...rest } = preference;
    return {
      ...rest,
      hasPassword: Boolean(passwordHash),
    };
  }

  @Put("/preferences")
  async updatePreferences(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Body() updates: Record<string, any>,
  ) {
    const userUUID = resolveUserUUID(req, authHeader);
    if (!userUUID) {
      throw new BadRequestException("Unable to resolve user");
    }
    const preference = await this.lockPreferenceService.updatePreferences(
      userUUID,
      updates,
    );
    const { passwordHash, ...rest } = preference;
    return {
      ...rest,
      hasPassword: Boolean(passwordHash),
    };
  }

  @Post("/password")
  async setPassword(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Body() body: { newPassword?: string; currentPassword?: string },
  ) {
    const userUUID = resolveUserUUID(req, authHeader);
    if (!userUUID) {
      throw new BadRequestException("Unable to resolve user");
    }
    if (!body?.newPassword) {
      throw new BadRequestException("newPassword is required");
    }
    return this.lockPreferenceService.setPassword(
      userUUID,
      body.newPassword,
      body.currentPassword,
    );
  }

  @Post("/password/verify")
  async verifyPassword(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Body() body: { password?: string },
  ) {
    const userUUID = resolveUserUUID(req, authHeader);
    if (!userUUID) {
      throw new BadRequestException("Unable to resolve user");
    }
    if (!body?.password) {
      throw new BadRequestException("password is required");
    }
    const isValid = await this.lockPreferenceService.verifyPassword(
      userUUID,
      body.password,
    );
    return { valid: isValid };
  }
}
