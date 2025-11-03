import { UserEntity } from "../entities/user.entity";
import { ApiKeyEntity } from "../entities/api-key.entity";
import { Request } from "express";

export interface ExpressRequest extends Request {
  user?: UserEntity;
  apiKey?: ApiKeyEntity;
}
