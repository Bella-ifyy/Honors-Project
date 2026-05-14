import { Test, TestingModule } from "@nestjs/testing";
import { NoteController } from "./note.controller";
import { NoteService } from "./note.service";
import { AuthGuard } from "../../guards/auth.guard";
import { AuthService } from "../auth/auth.service";

describe("NoteController", () => {
  let controller: NoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        { provide: NoteService, useValue: {} },
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

    controller = module.get<NoteController>(NoteController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
