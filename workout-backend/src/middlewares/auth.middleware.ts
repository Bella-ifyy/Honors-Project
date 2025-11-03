import { Injectable, NestMiddleware } from "@nestjs/common";
import { ExpressRequest } from "../types/expressRequest.interface";
import { NextFunction, Response } from "express";
import { JWT_SECRET } from "../config";
import { verify } from "jsonwebtoken";
import { AuthService } from "../modules/auth/auth.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    const authorization = req.headers.authorization ?? "";

    if (!authorization) {
      req.user = null;
      return next();
    }

    try {
      let user = null;

      if (authorization.startsWith("Bearer ")) {
        const jwtToken = authorization.substring(7);
        const decoded = verify(jwtToken, JWT_SECRET) as { id?: number };

        if (decoded?.id) {
          user = await this.authService.findByID(decoded.id);
        }
      }

      // Fall back to treating the header as a UUID if JWT validation fails
      if (!user) {
        const possibleUUID = authorization.replace(/^Bearer\s+/i, "");
        user = await this.authService.findByUUID(possibleUUID);
      }

      req.user = user ?? null;
      return next();
    } catch (err) {
      req.user = null;
      return next();
    }
  }
}
