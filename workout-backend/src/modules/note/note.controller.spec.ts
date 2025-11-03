import { Test, TestingModule } from "@nestjs/testing";
import { NoteController } from "./note.controller";
import { NoteService } from "./note.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NoteEntity } from "@app/entities/note.entity";

describe("NoteController", () => {
  let controller: NoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        NoteService,
        {
          provide: getRepositoryToken(NoteEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
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
