import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiaryEntryEntity } from "../../entities/diary-entry.entity";
import { DiaryService } from "./diary.service";
import { DiaryController } from "./diary.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([DiaryEntryEntity]), AuthModule],
  controllers: [DiaryController],
  providers: [DiaryService],
  exports: [DiaryService],
})
export class DiaryModule {}
