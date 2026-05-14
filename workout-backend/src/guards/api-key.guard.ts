import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApiKeyService } from "../modules/integration/api-key.service";
import { API_KEY_SCOPES } from "../decorators/api-key-scopes.decorator";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers?.authorization ?? "";
    const apiKeyHeader: string =
      request.headers?.["x-api-key"] ??
      request.headers?.["x-workout-api-key"] ??
      "";
    const raw =
      (typeof apiKeyHeader === "string" && apiKeyHeader.trim()) ||
      (authHeader.startsWith("Bearer ")
        ? authHeader.replace(/^Bearer\s+/i, "").trim()
        : authHeader.trim());

    if (!raw) {
      throw new UnauthorizedException("API key missing");
    }

    const apiKey = await this.apiKeyService.validateKey(raw);
    if (!apiKey) {
      throw new UnauthorizedException("Invalid API key");
    }

    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(API_KEY_SCOPES, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (
      requiredScopes.length &&
      !this.apiKeyService.hasScopes(apiKey.scopes ?? [], requiredScopes)
    ) {
      throw new ForbiddenException("API key lacks required scope");
    }

    request.apiKey = apiKey;
    return true;
  }
}
