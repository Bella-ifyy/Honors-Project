import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import ormconfig from "./ormconfig";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthMiddleware } from "./middlewares/auth.middleware";
import { AuthModule } from "./modules/auth/auth.module";
import { TaskModule } from "./modules/task/task.module";
import { NoteModule } from "./modules/note/note.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { DiaryModule } from "./modules/diary/diary.module";
import { LockPreferenceModule } from "./modules/lock-preference/lock-preference.module";
import { IntegrationModule } from "./modules/integration/integration.module";
import { DelegateModule } from "./modules/delegate/delegate.module";
import { WorkoutModule } from "./modules/workout/workout.module";

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    ScheduleModule.forRoot(),
    AuthModule,
    TaskModule,
    NoteModule,
    DelegateModule,
    NotificationModule,
    DiaryModule,
    LockPreferenceModule,
    IntegrationModule,
    WorkoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
