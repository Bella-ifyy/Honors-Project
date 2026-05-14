import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TaskService } from "./task.service";
import { TaskEntity } from "@app/entities/task.entity";
import { UserEntity } from "@app/entities/user.entity";
import { NoteEntity } from "@app/entities/note.entity";
import { TaskShareEntity } from "@app/entities/task-share.entity";
import { DelegateEntity } from "@app/entities/delegate.entity";
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
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskShareEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DelegateEntity),
          useValue: {},
        },
        { provide: PushNotificationService, useValue: {} },
        { provide: EmailNotificationService, useValue: {} },
        { provide: NotificationPreferenceService, useValue: {} },
        { provide: AutoCategorizationService, useValue: {} },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
