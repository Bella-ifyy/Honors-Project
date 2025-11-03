import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
} from "class-validator";

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  dueDate: Date;
}
