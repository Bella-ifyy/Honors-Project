import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LockPreferenceEntity } from "../../entities/lock-preference.entity";
import { LockPreferenceService } from "./lock-preference.service";
import { LockPreferenceController } from "./lock-preference.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([LockPreferenceEntity]), AuthModule],
  controllers: [LockPreferenceController],
  providers: [LockPreferenceService],
  exports: [LockPreferenceService],
})
export class LockPreferenceModule {}
