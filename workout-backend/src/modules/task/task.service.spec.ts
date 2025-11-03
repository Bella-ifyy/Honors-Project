import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TaskService } from "./task.service";
import { TaskEntity } from "@app/entities/task.entity";
import { UserEntity } from "@app/entities/user.entity";
import { NoteEntity } from "@app/entities/note.entity";
import { PushNotificationService } from "@app/modules/auth/push-notification-service.service";
import { EmailNotificationService } from "@app/modules/notification/email-notification.service";
import { NotificationPreferenceService } from "@app/modules/notification/notification-preference.service";
import { AutoCategorizationService } from "@app/modules/ai/auto-categorization.service";

describe("TaskService", () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NoteEntity),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: PushNotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: EmailNotificationService,
          useValue: {
            sendTaskReminderEmail: jest.fn(),
            sendDailyPlanningEmail: jest.fn(),
            sendEveningReviewEmail: jest.fn(),
          },
        },
        {
          provide: NotificationPreferenceService,
          useValue: {
            getOrCreatePreferences: jest.fn().mockResolvedValue({
              dailyPlanningPush: true,
              dailyPlanningEmail: true,
              dailyPlanningTime: "08:00",
              dailyPlanningLastSent: null,
              eveningReviewPush: true,
              eveningReviewEmail: true,
              eveningReviewTime: "20:00",
              eveningReviewLastSent: null,
              pushNotifications: true,
              emailNotifications: true,
            }),
            updatePreferences: jest.fn(),
            shouldSendPushNotification: jest.fn(),
            shouldSendEmailNotification: jest.fn(),
          },
        },
        {
          provide: AutoCategorizationService,
          useValue: {
            categorizeContent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
