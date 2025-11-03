import { IsOptional, IsString, IsNumber } from "class-validator";

export class IntegrationNoteDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  taskId?: number;
}
