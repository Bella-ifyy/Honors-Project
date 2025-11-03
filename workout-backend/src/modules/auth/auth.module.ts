import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthGuard } from "../../guards/auth.guard";
import { UserEntity } from "../../entities/user.entity";
import { TaskService } from "../task/task.service";
import { TaskEntity } from "../../entities/task.entity";
import { PushDeviceEntity } from "../../entities/push-device.entity";
import { PushNotificationService } from "./push-notification-service.service";
import { NoteEntity } from "../../entities/note.entity";
import { NoteService } from "../note/note.service";
import { EmailNotificationService } from "../notification/email-notification.service";
import { NotificationPreferenceService } from "../notification/notification-preference.service";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";
import { AiModule } from "../ai/ai.module";
import { TaskShareEntity } from "../../entities/task-share.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { DelegateEntity } from "../../entities/delegate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskEntity,
      UserEntity,
      PushDeviceEntity,
      NoteEntity,
      TaskShareEntity,
      NoteShareEntity,
      DelegateEntity,
      NotificationPreferenceEntity,
    ]),
    AiModule,
  ],
  controllers: [AuthController],
  providers: [
    PushNotificationService,
    AuthService,
    TaskService,
    NoteService,
    EmailNotificationService,
    NotificationPreferenceService,
    AuthGuard,
  ],
  exports: [
    TaskService,
    PushNotificationService,
    AuthService,
    NoteService,
    EmailNotificationService,
    NotificationPreferenceService,
    AuthGuard,
  ],
})
export class AuthModule {}
