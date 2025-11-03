import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../../entities/api-key.entity";
import { ApiKeyService } from "./api-key.service";
import { ApiKeyGuard } from "../../guards/api-key.guard";
import { ApiKeyController } from "./api-key.controller";
import { IntegrationController } from "./integration.controller";
import { NoteModule } from "../note/note.module";
import { TaskModule } from "../task/task.module";

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity]), NoteModule, TaskModule],
  controllers: [ApiKeyController, IntegrationController],
  providers: [ApiKeyService, ApiKeyGuard],
  exports: [ApiKeyService],
})
export class IntegrationModule {}
