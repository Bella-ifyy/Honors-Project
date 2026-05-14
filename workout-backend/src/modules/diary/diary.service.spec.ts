import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DiaryService } from "./diary.service";
import { DiaryEntryEntity } from "../../entities/diary-entry.entity";

const createRepoMock = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn((value) => value),
  createQueryBuilder: jest.fn(),
});

describe("DiaryService", () => {
  let service: DiaryService;
  let diaryRepository: ReturnType<typeof createRepoMock>;

  beforeEach(async () => {
    diaryRepository = createRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryService,
        {
          provide: getRepositoryToken(DiaryEntryEntity),
          useValue: diaryRepository,
        },
      ],
    }).compile();

    service = module.get<DiaryService>(DiaryService);
  });

  it("creates a progress journal entry with normalized mood and trimmed tags", async () => {
    diaryRepository.save.mockImplementation(async (value) => ({
      id: 91,
      ...value,
    }));

    const result = await service.createEntry(
      {
        title: "  Leg day reflection  ",
        content: "Progress feels visible.",
        mood: "energized",
        tags: ["legs", " ", "strength"],
      },
      "user-1",
    );

    expect(diaryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        title: "Leg day reflection",
        content: "Progress feels visible.",
        mood: "energized",
        tags: ["legs", "strength"],
        favorite: false,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 91,
        mood: "energized",
        tags: ["legs", "strength"],
      }),
    );
  });

  it("updates an existing progress journal entry and applies favorite state", async () => {
    const existing = {
      id: 15,
      userUUID: "user-1",
      title: "Old title",
      content: "Old content",
      mood: "reflective",
      tags: ["old"],
      favorite: false,
      updatedAt: new Date("2026-05-01T00:00:00.000Z"),
    };
    diaryRepository.findOne.mockResolvedValue(existing);
    diaryRepository.save.mockImplementation(async (value) => value);

    const result = await service.updateEntry(15, "user-1", {
      title: "New title",
      content: "New content",
      mood: "grateful",
      favorite: true,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 15,
        title: "New title",
        content: "New content",
        mood: "grateful",
        favorite: true,
      }),
    );
    expect(diaryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 15,
        title: "New title",
        favorite: true,
      }),
    );
  });

  it("toggles the favorite flag for a workout progress journal entry", async () => {
    const existing = {
      id: 27,
      userUUID: "user-1",
      title: "Weekly check-in",
      content: "",
      mood: "reflective",
      tags: [],
      favorite: false,
      updatedAt: new Date("2026-05-01T00:00:00.000Z"),
    };
    diaryRepository.findOne.mockResolvedValue(existing);
    diaryRepository.save.mockImplementation(async (value) => value);

    const result = await service.toggleFavorite(27, "user-1");

    expect(result.favorite).toBe(true);
    expect(diaryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 27,
        favorite: true,
      }),
    );
  });
});
