import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { WorkoutProfileService } from "./workout-profile.service";
import { WorkoutProfileEntity } from "../../entities/workout-profile.entity";
import { UserEntity } from "../../entities/user.entity";

const createRepoMock = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  create: jest.fn((value) => value),
});

describe("WorkoutProfileService", () => {
  let service: WorkoutProfileService;
  let profileRepository: ReturnType<typeof createRepoMock>;
  let userRepository: ReturnType<typeof createRepoMock>;

  beforeEach(async () => {
    profileRepository = createRepoMock();
    userRepository = createRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutProfileService,
        {
          provide: getRepositoryToken(WorkoutProfileEntity),
          useValue: profileRepository,
        },
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
      ],
    }).compile();

    service = module.get<WorkoutProfileService>(WorkoutProfileService);
  });

  it("returns incomplete state when a workout profile does not exist", async () => {
    profileRepository.findOne.mockResolvedValue(null);

    const result = await service.getProfile("user-1");

    expect(result).toEqual({ profile: null, completed: false });
  });

  it("upserts a workout profile, encodes arrays, and marks onboarding completed", async () => {
    profileRepository.findOne.mockResolvedValue(null);
    profileRepository.save.mockImplementation(async (value) => ({
      id: 99,
      ...value,
    }));

    const result = await service.upsertProfile("user-1", {
      age: "29",
      primaryGoal: "Build muscle",
      weeklyWorkouts: "4",
      workoutTypes: ["strength", "hiit"],
      targetAreas: ["legs", "core"],
      equipmentAccess: ["barbell", "dumbbells"],
      units: "metric",
    });

    expect(profileRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        age: 29,
        weeklyWorkouts: 4,
        workoutTypes: JSON.stringify(["strength", "hiit"]),
        targetAreas: JSON.stringify(["legs", "core"]),
        equipmentAccess: JSON.stringify(["barbell", "dumbbells"]),
      }),
    );
    expect(userRepository.update).toHaveBeenCalledWith(
      { uuid: "user-1" },
      { workoutOnboardingCompleted: true },
    );
    expect(result).toEqual(
      expect.objectContaining({
        completed: true,
        profile: expect.objectContaining({
          userUUID: "user-1",
          workoutTypes: ["strength", "hiit"],
          targetAreas: ["legs", "core"],
          equipmentAccess: ["barbell", "dumbbells"],
        }),
      }),
    );
  });
});
