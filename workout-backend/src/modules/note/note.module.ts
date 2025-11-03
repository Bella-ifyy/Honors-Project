import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoteEntity } from "../../entities/note.entity";
import { NoteController } from "./note.controller";
import { NoteService } from "./note.service";
import { TaskEntity } from "../../entities/task.entity";
import { UserEntity } from "../../entities/user.entity";
import { PushDeviceEntity } from "../../entities/push-device.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { DelegateEntity } from "../../entities/delegate.entity";
import { TaskShareEntity } from "../../entities/task-share.entity";
import { TaskService } from "../task/task.service";
import { PushNotificationService } from "../auth/push-notification-service.service";
import { AuthService } from "../auth/auth.service";
import { EmailNotificationService } from "../notification/email-notification.service";
import { NotificationPreferenceService } from "../notification/notification-preference.service";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";
import { AiModule } from "../ai/ai.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskEntity,
      UserEntity,
      PushDeviceEntity,
      NoteEntity,
      NoteShareEntity,
      TaskShareEntity,
      DelegateEntity,
      NotificationPreferenceEntity,
    ]),
    AiModule,
    AuthModule,
  ],
  controllers: [NoteController],
  providers: [
    TaskService,
    PushNotificationService,
    AuthService,
    NoteService,
    EmailNotificationService,
    NotificationPreferenceService,
  ],
  exports: [
    TaskService,
    PushNotificationService,
    AuthService,
    NoteService,
    EmailNotificationService,
    NotificationPreferenceService,
  ],
})
export class NoteModule {}
