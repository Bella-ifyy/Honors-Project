import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationController } from "./notification.controller";
import { NotificationPreferenceService } from "./notification-preference.service";
import { EmailNotificationService } from "./email-notification.service";
import { InboxService } from "./inbox.service";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";
import { InboxMessageEntity } from "../../entities/inbox-message.entity";
import { UserEntity } from "../../entities/user.entity";
import { TaskEntity } from "../../entities/task.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationPreferenceEntity,
      UserEntity,
      InboxMessageEntity,
      TaskEntity,
    ]),
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationPreferenceService,
    EmailNotificationService,
    InboxService,
  ],
  exports: [
    NotificationPreferenceService,
    EmailNotificationService,
    InboxService,
  ],
})
export class NotificationModule {}
