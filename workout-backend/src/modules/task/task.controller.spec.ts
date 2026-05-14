import { Test, TestingModule } from "@nestjs/testing";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { AuthGuard } from "../../guards/auth.guard";
import { AuthService } from "../auth/auth.service";

describe("TaskController", () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: TaskService, useValue: {} },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AuthService,
          useValue: {
            findByID: jest.fn(),
            findByUUID: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
