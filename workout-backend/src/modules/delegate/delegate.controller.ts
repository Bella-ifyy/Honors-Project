import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import { DelegateService } from "./delegate.service";

@Controller("delegates")
export class DelegateController {
  constructor(private readonly delegateService: DelegateService) {}

  @Get()
  @UseGuards(AuthGuard)
  async listDelegates(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.delegateService.listDelegates(userUUID);
  }

  @Post()
  @UseGuards(AuthGuard)
  async addDelegate(
    @Req() req: ExpressRequest,
    @Body() payload: { email?: string },
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.delegateService.addDelegate(
      userUUID,
      payload?.email ?? "",
    );
  }

  @Delete(":delegateUUID")
  @UseGuards(AuthGuard)
  async removeDelegate(
    @Req() req: ExpressRequest,
    @Param("delegateUUID") delegateUUID: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.delegateService.removeDelegate(userUUID, delegateUUID);
  }
}
