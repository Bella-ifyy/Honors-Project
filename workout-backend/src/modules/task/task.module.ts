import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { TaskController } from "./task.controller";
import { PushNotificationService } from "../auth/push-notification-service.service";
import { AuthModule } from "../auth/auth.module";
import { UserEntity } from "../../entities/user.entity";
import { PushDeviceEntity } from "../../entities/push-device.entity";
import { AuthService } from "../auth/auth.service";
import { NoteEntity } from "../../entities/note.entity";
import { TaskShareEntity } from "../../entities/task-share.entity";
import { DelegateEntity } from "../../entities/delegate.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { NoteService } from "../note/note.service";
import { EmailNotificationService } from "../notification/email-notification.service";
import { NotificationPreferenceService } from "../notification/notification-preference.service";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";
import { AiModule } from "../ai/ai.module";
import { ReminderScheduler } from "./reminder.scheduler";
import { CronController } from "./cron.controller";

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
    AuthModule,
  ],
  controllers: [TaskController, CronController],
  providers: [
    TaskService,
    PushNotificationService,
    AuthService,
    NoteService,
    EmailNotificationService,
    NotificationPreferenceService,
    ReminderScheduler,
  ],
  exports: [
    TaskService,
    PushNotificationService,
    AuthService,
    NoteService,
    EmailNotificationService,
    NotificationPreferenceService,
    ReminderScheduler,
  ],
})
export class TaskModule {}
