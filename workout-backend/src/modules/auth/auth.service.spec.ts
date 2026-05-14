import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AuthService } from "./auth.service";
import { UserEntity } from "../../entities/user.entity";
import { PushDeviceEntity } from "../../entities/push-device.entity";
import { NotificationPreferenceEntity } from "../../entities/notification-preference.entity";
import { TaskEntity } from "../../entities/task.entity";
import { NoteEntity } from "../../entities/note.entity";
import { TaskService } from "../task/task.service";
import { EmailNotificationService } from "../notification/email-notification.service";
import { NoteService } from "../note/note.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: getRepositoryToken(PushDeviceEntity), useValue: {} },
        {
          provide: getRepositoryToken(NotificationPreferenceEntity),
          useValue: {},
        },
        { provide: getRepositoryToken(TaskEntity), useValue: {} },
        { provide: getRepositoryToken(NoteEntity), useValue: {} },
        { provide: TaskService, useValue: {} },
        { provide: EmailNotificationService, useValue: {} },
        { provide: NoteService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
