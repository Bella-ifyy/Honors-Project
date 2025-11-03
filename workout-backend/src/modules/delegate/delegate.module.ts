import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DelegateEntity } from "../../entities/delegate.entity";
import { UserEntity } from "../../entities/user.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { TaskShareEntity } from "../../entities/task-share.entity";
import { DelegateController } from "./delegate.controller";
import { DelegateService } from "./delegate.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DelegateEntity,
      UserEntity,
      NoteShareEntity,
      TaskShareEntity,
    ]),
    AuthModule,
  ],
  controllers: [DelegateController],
  providers: [DelegateService],
  exports: [DelegateService],
})
export class DelegateModule {}
