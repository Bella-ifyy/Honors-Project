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
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import { ApiKeyService } from "./api-key.service";
import { CreateApiKeyDto } from "./dto/api-key.dto";

@Controller("api-keys")
@UseGuards(AuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  async listKeys(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return this.apiKeyService.listKeys(userUUID);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createKey(
    @Req() req: ExpressRequest,
    @Body() body: CreateApiKeyDto,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    const result = await this.apiKeyService.createKey(
      userUUID,
      body?.name,
      body?.scopes,
    );
    return {
      id: result.apiKey.id,
      name: result.apiKey.name,
      prefix: result.apiKey.prefix,
      scopes: result.apiKey.scopes,
      createdAt: result.apiKey.createdAt,
      token: result.token,
    };
  }

  @Delete(":id")
  async revokeKey(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    const key = await this.apiKeyService.revokeKey(userUUID, Number(id));
    return { revoked: Boolean(key), id: Number(id) };
  }
}
