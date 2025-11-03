import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AutoCategorizationService } from "./auto-categorization.service";

@Module({
  providers: [AutoCategorizationService],
  exports: [AutoCategorizationService],
})
export class AiModule {}
