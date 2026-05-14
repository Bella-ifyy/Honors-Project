import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { WorkoutService } from "./workout.service";
import { WorkoutEntity } from "../../entities/workout.entity";
import { ExerciseEntity } from "../../entities/exercise.entity";
import { WorkoutExerciseEntity } from "../../entities/workout-exercise.entity";
import { WorkoutRoutineEntity } from "../../entities/workout-routine.entity";
import { RoutineExerciseEntity } from "../../entities/routine-exercise.entity";
import { ProgressEntity } from "../../entities/progress.entity";
import { UserEntity } from "../../entities/user.entity";
import { ExerciseFavoriteEntity } from "../../entities/exercise-favorite.entity";
import { RoutineFavoriteEntity } from "../../entities/routine-favorite.entity";
import { WorkoutReminderEntity } from "../../entities/workout-reminder.entity";

const createRepoMock = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn((value) => value),
});

describe("WorkoutService", () => {
  let service: WorkoutService;
  let workoutRepository: ReturnType<typeof createRepoMock>;
  let exerciseRepository: ReturnType<typeof createRepoMock>;
  let workoutExerciseRepository: ReturnType<typeof createRepoMock>;
  let routineRepository: ReturnType<typeof createRepoMock>;
  let routineExerciseRepository: ReturnType<typeof createRepoMock>;
  let progressRepository: ReturnType<typeof createRepoMock>;
  let userRepository: ReturnType<typeof createRepoMock>;
  let exerciseFavoriteRepository: ReturnType<typeof createRepoMock>;
  let routineFavoriteRepository: ReturnType<typeof createRepoMock>;
  let workoutReminderRepository: ReturnType<typeof createRepoMock>;

  beforeEach(async () => {
    workoutRepository = createRepoMock();
    exerciseRepository = createRepoMock();
    workoutExerciseRepository = createRepoMock();
    routineRepository = createRepoMock();
    routineExerciseRepository = createRepoMock();
    progressRepository = createRepoMock();
    userRepository = createRepoMock();
    exerciseFavoriteRepository = createRepoMock();
    routineFavoriteRepository = createRepoMock();
    workoutReminderRepository = createRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        {
          provide: getRepositoryToken(WorkoutEntity),
          useValue: workoutRepository,
        },
        {
          provide: getRepositoryToken(ExerciseEntity),
          useValue: exerciseRepository,
        },
        {
          provide: getRepositoryToken(WorkoutExerciseEntity),
          useValue: workoutExerciseRepository,
        },
        {
          provide: getRepositoryToken(WorkoutRoutineEntity),
          useValue: routineRepository,
        },
        {
          provide: getRepositoryToken(RoutineExerciseEntity),
          useValue: routineExerciseRepository,
        },
        {
          provide: getRepositoryToken(ProgressEntity),
          useValue: progressRepository,
        },
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        {
          provide: getRepositoryToken(ExerciseFavoriteEntity),
          useValue: exerciseFavoriteRepository,
        },
        {
          provide: getRepositoryToken(RoutineFavoriteEntity),
          useValue: routineFavoriteRepository,
        },
        {
          provide: getRepositoryToken(WorkoutReminderEntity),
          useValue: workoutReminderRepository,
        },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
  });

  it("creates a workout and returns hydrated workout exercises", async () => {
    workoutRepository.save.mockResolvedValue({
      id: 11,
      userUUID: "user-1",
      name: "Leg Day",
      totalDuration: 45,
      caloriesBurned: 320,
      isCompleted: true,
      date: new Date("2026-05-07T08:00:00.000Z"),
    });
    workoutExerciseRepository.save.mockImplementation(async (value) => value);
    workoutExerciseRepository.find.mockResolvedValue([
      {
        id: 21,
        workoutId: 11,
        exerciseId: 7,
        sets: 4,
        reps: 8,
        orderIndex: 0,
      },
    ]);
    exerciseRepository.find.mockResolvedValue([
      {
        id: 7,
        name: "Barbell Squat",
        type: "strength",
      },
    ]);

    const result = await service.createWorkout(
      {
        name: "Leg Day",
        totalDuration: 45,
        caloriesBurned: 320,
        isCompleted: true,
        exercises: [
          {
            exerciseId: 7,
            sets: 4,
            reps: 8,
          },
        ],
      },
      "user-1",
    );

    expect(workoutRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        name: "Leg Day",
        totalDuration: 45,
        caloriesBurned: 320,
        isCompleted: true,
      }),
    );
    expect(workoutExerciseRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutId: 11,
        exerciseId: 7,
        sets: 4,
        reps: 8,
        orderIndex: 0,
      }),
    );
    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0]).toEqual(
      expect.objectContaining({
        exerciseId: 7,
        sets: 4,
        reps: 8,
        exercise: expect.objectContaining({
          name: "Barbell Squat",
        }),
      }),
    );
  });

  it("builds a workout dashboard summary with totals, favorite workout, and improvement areas", async () => {
    const now = new Date();
    const today = now.toISOString();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 10);

    workoutRepository.find.mockResolvedValue([
      {
        id: 1,
        name: "Push Day",
        caloriesBurned: 250,
        totalDuration: 40,
        isCompleted: true,
        date: today,
      },
      {
        id: 2,
        name: "Push Day",
        caloriesBurned: 300,
        totalDuration: 42,
        isCompleted: true,
        date: twoDaysAgo.toISOString(),
      },
      {
        id: 3,
        name: "Cardio Blast",
        caloriesBurned: 200,
        totalDuration: 30,
        isCompleted: false,
        date: tenDaysAgo.toISOString(),
      },
    ]);
    workoutExerciseRepository.find.mockResolvedValue([
      { workoutId: 1, exerciseId: 101 },
      { workoutId: 2, exerciseId: 102 },
      { workoutId: 3, exerciseId: 103 },
    ]);
    exerciseRepository.find.mockResolvedValue([
      { id: 101, type: "strength" },
      { id: 102, type: "strength" },
      { id: 103, type: "cardio" },
    ]);

    const summary = await service.getDashboardSummary("user-1");

    expect(summary).toEqual(
      expect.objectContaining({
        totalWorkouts: 3,
        totalCaloriesBurned: 750,
        totalDuration: 112,
        completedWorkouts: 2,
        weeklyWorkouts: 2,
        monthlyWorkouts: 3,
        favoriteWorkout: "Push Day",
      }),
    );
    expect(summary.improvementAreas).toEqual(["cardio", "strength"]);
  });

  it("stores workout reminder days and returns them decoded", async () => {
    workoutReminderRepository.findOne.mockResolvedValue(null);
    workoutReminderRepository.save.mockImplementation(async (value) => ({
      ...value,
      id: 55,
    }));

    const result = await service.setReminder("user-1", {
      enabled: true,
      timeOfDay: "07:00",
      days: ["Mon", "Wed", "Fri"],
    });

    expect(workoutReminderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        enabled: true,
        timeOfDay: "07:00",
        days: JSON.stringify(["Mon", "Wed", "Fri"]),
      }),
    );
    expect(result.days).toEqual(["Mon", "Wed", "Fri"]);
  });

  it("creates a workout routine and returns decoded scheduled days with hydrated exercises", async () => {
    routineRepository.save.mockResolvedValue({
      id: 41,
      userUUID: "user-1",
      name: "Starter Split",
      scheduledDays: JSON.stringify(["Mon", "Thu"]),
      isPreDefined: false,
    });
    routineExerciseRepository.save.mockImplementation(async (value) => value);
    routineExerciseRepository.find.mockResolvedValue([
      {
        id: 61,
        routineId: 41,
        exerciseId: 12,
        targetSets: 3,
        targetReps: 12,
        orderIndex: 0,
      },
    ]);
    exerciseRepository.find.mockResolvedValue([
      {
        id: 12,
        name: "Dumbbell Press",
      },
    ]);

    const result = await service.createRoutine(
      {
        name: "Starter Split",
        scheduledDays: ["Mon", "Thu"],
        exercises: [{ exerciseId: 12, targetSets: 3, targetReps: 12 }],
      },
      "user-1",
    );

    expect(routineRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        name: "Starter Split",
        scheduledDays: JSON.stringify(["Mon", "Thu"]),
      }),
    );
    expect(result.scheduledDays).toEqual(["Mon", "Thu"]);
    expect(result.exercises[0]).toEqual(
      expect.objectContaining({
        exerciseId: 12,
        exercise: expect.objectContaining({ name: "Dumbbell Press" }),
      }),
    );
  });

  it("creates a progress entry for the workout journey", async () => {
    progressRepository.save.mockImplementation(async (value) => ({
      id: 77,
      ...value,
    }));

    const result = await service.createProgress(
      {
        weight: 78.5,
        bodyFatPercentage: 16.2,
        notes: "Felt stronger this week",
      },
      "user-1",
    );

    expect(progressRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        weight: 78.5,
        bodyFatPercentage: 16.2,
        notes: "Felt stronger this week",
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 77,
        userUUID: "user-1",
        notes: "Felt stronger this week",
      }),
    );
  });

  it("returns weekly and monthly workout progress metrics", async () => {
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 12);

    workoutRepository.find.mockResolvedValue([
      {
        id: 1,
        date: now.toISOString(),
        caloriesBurned: 300,
      },
      {
        id: 2,
        date: oneDayAgo.toISOString(),
        caloriesBurned: 250,
      },
      {
        id: 3,
        date: oneMonthAgo.toISOString(),
        caloriesBurned: 200,
      },
    ]);

    const result = await service.getProgressMetrics("user-1");

    expect(result.weeklyData).toHaveLength(7);
    expect(result.monthlyData).toHaveLength(4);
    expect(
      result.weeklyData.reduce((sum, item) => sum + item.workouts, 0),
    ).toBe(2);
    expect(
      result.monthlyData.reduce((sum, item) => sum + item.workouts, 0),
    ).toBe(3);
  });

  it("toggles an exercise favorite on for a workout user when no favorite exists", async () => {
    exerciseFavoriteRepository.findOne.mockResolvedValue(null);
    exerciseFavoriteRepository.save.mockImplementation(async (value) => ({
      id: 501,
      ...value,
    }));

    const result = await service.toggleExerciseFavorite(9, "user-1");

    expect(exerciseFavoriteRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userUUID: "user-1",
        exerciseId: 9,
      }),
    );
    expect(result).toEqual({ isFavorite: true });
  });
});
