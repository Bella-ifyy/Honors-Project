import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  scopes?: string[];
}
