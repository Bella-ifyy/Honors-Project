import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import { DiaryService } from "./diary.service";

function getUserUUID(req: ExpressRequest, fallback?: string) {
  return req.user?.uuid || fallback;
}

@Controller("diary")
@UseGuards(AuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get()
  async listEntries(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.listEntries(userUUID);
  }

  @Get("search")
  async searchEntries(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Query("q") query?: string,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.searchEntries(userUUID, query);
  }

  @Get(":id")
  async getEntry(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Param("id") id: string,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.getEntryById(Number(id), userUUID);
  }

  @Post()
  async createEntry(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Body() payload: any,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.createEntry(payload, userUUID);
  }

  @Put(":id")
  async updateEntry(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Param("id") id: string,
    @Body() payload: any,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.updateEntry(Number(id), userUUID, payload);
  }

  @Delete(":id")
  async deleteEntry(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Param("id") id: string,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.deleteEntry(Number(id), userUUID);
  }

  @Put(":id/favorite")
  async toggleFavorite(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
    @Param("id") id: string,
  ) {
    const userUUID = getUserUUID(req, authHeader);
    return this.diaryService.toggleFavorite(Number(id), userUUID);
  }
}
