import { SetMetadata } from "@nestjs/common";

export const API_KEY_SCOPES = "apiKeyScopes";

export const ApiKeyScopes = (...scopes: string[]) =>
  SetMetadata(API_KEY_SCOPES, scopes);
