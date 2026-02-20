import { ExpressRequest } from "../types/expressRequest.interface";
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { AuthService } from "../modules/auth/auth.service";
import { JWT_SECRET } from "../config";
import { verify } from "jsonwebtoken";
import { UserEntity } from "../entities/user.entity";

const sanitizeHeader = (value?: string) =>
  value?.replace(/^Bearer\s+/i, "").trim();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  private async resolveUserFromHeader(
    request: ExpressRequest,
  ): Promise<UserEntity | null> {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return null;
    }

    const sanitized = sanitizeHeader(authorization);
    if (!sanitized) {
      return null;
    }

    let user: UserEntity | null = null;

    if (authorization.startsWith("Bearer ")) {
      try {
        const decoded = verify(sanitized, JWT_SECRET) as { id?: number };
        if (decoded?.id) {
          const found = await this.authService.findByID(decoded.id);
          if (found) {
            user = found;
          }
        }
      } catch (_error) {
      }
    }

    if (!user) {
      const fallback = await this.authService.findByUUID(sanitized);
      if (fallback) {
        user = fallback;
      }
    }

    if (user) {
      request.user = user;
      return user;
    }

    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>();

    if (request.user) {
      return true;
    }

    const resolved = await this.resolveUserFromHeader(request);
    if (resolved) {
      return true;
    }

    throw new HttpException("Not authorized", HttpStatus.UNAUTHORIZED);
  }
}
