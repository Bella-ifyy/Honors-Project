import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NoteService } from "./note.service";
import { NoteEntity } from "../../entities/note.entity";
import { TaskEntity } from "../../entities/task.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { DelegateEntity } from "../../entities/delegate.entity";
import { UserEntity } from "../../entities/user.entity";
import { AutoCategorizationService } from "../ai/auto-categorization.service";

describe("NoteService", () => {
  let service: NoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        { provide: getRepositoryToken(NoteEntity), useValue: {} },
        { provide: getRepositoryToken(TaskEntity), useValue: {} },
        { provide: getRepositoryToken(NoteShareEntity), useValue: {} },
        { provide: getRepositoryToken(DelegateEntity), useValue: {} },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: AutoCategorizationService, useValue: {} },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
