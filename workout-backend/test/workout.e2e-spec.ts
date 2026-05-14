import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { WorkoutController } from "../src/modules/workout/workout.controller";
import { PublicWorkoutController } from "../src/modules/workout/public-workout.controller";
import { WorkoutService } from "../src/modules/workout/workout.service";
import { AuthService } from "../src/modules/auth/auth.service";
import { WorkoutProfileController } from "../src/modules/workout/workout-profile.controller";
import { WorkoutProfileService } from "../src/modules/workout/workout-profile.service";
import { DiaryController } from "../src/modules/diary/diary.controller";
import { DiaryService } from "../src/modules/diary/diary.service";

describe("Workout routes (e2e)", () => {
  let app: INestApplication;

  const workoutServiceMock = {
    createWorkout: jest.fn().mockImplementation(async (payload, userUUID) => ({
      id: 55,
      ...payload,
      userUUID,
    })),
    getDashboardSummary: jest.fn().mockResolvedValue({
      totalWorkouts: 14,
      weeklyWorkouts: 4,
      monthlyWorkouts: 11,
      totalCaloriesBurned: 4210,
      totalDuration: 785,
      completedWorkouts: 13,
      currentStreak: 4,
      longestStreak: 8,
      favoriteWorkout: "Upper Body Push",
      improvementAreas: ["mobility", "cardio"],
    }),
    getProgressMetrics: jest.fn().mockResolvedValue({
      weeklyData: [
        { day: "Mon", workouts: 1, calories: 320 },
        { day: "Tue", workouts: 0, calories: 0 },
      ],
      monthlyData: [
        { month: "Feb", workouts: 3, calories: 900 },
        { month: "Mar", workouts: 5, calories: 1410 },
      ],
    }),
    getReminder: jest.fn().mockResolvedValue({
      enabled: true,
      timeOfDay: "18:00",
      days: ["Mon", "Wed", "Fri"],
    }),
    setReminder: jest.fn().mockImplementation(async (userUUID, payload) => ({
      userUUID,
      enabled: payload.enabled,
      timeOfDay: payload.timeOfDay,
      days: payload.days,
    })),
    toggleExerciseFavorite: jest
      .fn()
      .mockImplementation(async (exerciseId, userUUID) => ({
        id: exerciseId,
        userUUID,
        favorite: true,
      })),
    createRoutine: jest.fn().mockImplementation(async (payload, userUUID) => ({
      id: 31,
      ...payload,
      userUUID,
    })),
    listRoutines: jest.fn().mockResolvedValue([
      {
        id: 31,
        name: "Starter Split",
        scheduledDays: ["Mon", "Thu"],
        difficulty: "Beginner",
      },
    ]),
    createProgress: jest.fn().mockImplementation(async (payload, userUUID) => ({
      id: 81,
      ...payload,
      userUUID,
    })),
    listProgress: jest.fn().mockResolvedValue([
      {
        id: 81,
        userUUID: "workout-user-123",
        weight: 78.5,
        bodyFatPercentage: 16.2,
        notes: "Felt stronger this week",
      },
    ]),
    listExercises: jest.fn().mockResolvedValue([
      { id: 7, name: "Barbell Squat", type: "strength" },
      { id: 9, name: "Treadmill Run", type: "cardio" },
    ]),
    listFavoriteExercises: jest
      .fn()
      .mockResolvedValue([
        { id: 7, name: "Barbell Squat", type: "strength", isFavorite: true },
      ]),
    getWorkoutTemplates: jest.fn().mockResolvedValue([
      { id: 1, name: "Beginner Full Body", difficulty: "Beginner" },
      { id: 2, name: "Fat Loss Circuit", difficulty: "Intermediate" },
    ]),
  };
  const workoutProfileServiceMock = {
    getProfile: jest.fn().mockResolvedValue({
      completed: true,
      profile: {
        userUUID: "workout-user-123",
        primaryGoal: "Build muscle",
        workoutTypes: ["strength", "hiit"],
      },
    }),
    upsertProfile: jest.fn().mockImplementation(async (userUUID, payload) => ({
      completed: true,
      profile: {
        userUUID,
        ...payload,
      },
    })),
  };
  const diaryServiceMock = {
    listEntries: jest.fn().mockResolvedValue([
      {
        id: 90,
        userUUID: "workout-user-123",
        title: "Week 4 check-in",
        content: "Stamina is improving.",
        mood: "energized",
        favorite: false,
      },
    ]),
    createEntry: jest.fn().mockImplementation(async (payload, userUUID) => ({
      id: 90,
      userUUID,
      ...payload,
    })),
    updateEntry: jest
      .fn()
      .mockImplementation(async (id, userUUID, payload) => ({
        id,
        userUUID,
        ...payload,
      })),
    toggleFavorite: jest.fn().mockImplementation(async (id, userUUID) => ({
      id,
      userUUID,
      favorite: true,
    })),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        WorkoutController,
        PublicWorkoutController,
        WorkoutProfileController,
        DiaryController,
      ],
      providers: [
        {
          provide: WorkoutService,
          useValue: workoutServiceMock,
        },
        {
          provide: WorkoutProfileService,
          useValue: workoutProfileServiceMock,
        },
        {
          provide: DiaryService,
          useValue: diaryServiceMock,
        },
        {
          provide: AuthService,
          useValue: {
            findByID: jest.fn(),
            findByUUID: jest.fn((uuid: string) =>
              uuid ? { uuid, email: `${uuid}@example.com` } : null,
            ),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("workout/api/v1");
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (app) {
      await app.close();
    }
  });

  it("GET /workout/api/v1/workout/exercise/list returns the workout exercise catalog", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/exercise/list")
      .expect(200)
      .expect([
        { id: 7, name: "Barbell Squat", type: "strength" },
        { id: 9, name: "Treadmill Run", type: "cardio" },
      ]);

    expect(workoutServiceMock.listExercises).toHaveBeenCalledTimes(1);
  });

  it("GET /workout/api/v1/workout/exercise/favorites resolves to the favorites handler rather than the single-exercise route", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/exercise/favorites")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect([
        { id: 7, name: "Barbell Squat", type: "strength", isFavorite: true },
      ]);

    expect(workoutServiceMock.listFavoriteExercises).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/public/workout/templates returns public workout templates", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/public/workout/templates")
      .expect(200)
      .expect([
        { id: 1, name: "Beginner Full Body", difficulty: "Beginner" },
        { id: 2, name: "Fat Loss Circuit", difficulty: "Intermediate" },
      ]);

    expect(workoutServiceMock.getWorkoutTemplates).toHaveBeenCalledTimes(1);
  });

  it("PUT /workout/api/v1/workout/exercise/:id/favorite toggles an exercise favorite for the workout user", async () => {
    await request(app.getHttpServer())
      .put("/workout/api/v1/workout/exercise/7/favorite")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 7,
            userUUID: "workout-user-123",
            favorite: true,
          }),
        );
      });

    expect(workoutServiceMock.toggleExerciseFavorite).toHaveBeenCalledWith(
      7,
      "workout-user-123",
    );
  });

  it("POST /workout/api/v1/workout/create creates a workout for the authenticated workout user", async () => {
    await request(app.getHttpServer())
      .post("/workout/api/v1/workout/create")
      .set("authorization", "Bearer workout-user-123")
      .send({
        name: "Pull Day",
        totalDuration: 50,
        caloriesBurned: 410,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 55,
            userUUID: "workout-user-123",
            name: "Pull Day",
          }),
        );
      });

    expect(workoutServiceMock.createWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Pull Day",
        totalDuration: 50,
        caloriesBurned: 410,
      }),
      "workout-user-123",
    );
  });

  it("POST /workout/api/v1/workout/routine/create creates a routine for the workout user", async () => {
    await request(app.getHttpServer())
      .post("/workout/api/v1/workout/routine/create")
      .set("authorization", "Bearer workout-user-123")
      .send({
        name: "Starter Split",
        difficulty: "Beginner",
        scheduledDays: ["Mon", "Thu"],
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 31,
            userUUID: "workout-user-123",
            name: "Starter Split",
            difficulty: "Beginner",
          }),
        );
      });

    expect(workoutServiceMock.createRoutine).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Starter Split",
        difficulty: "Beginner",
        scheduledDays: ["Mon", "Thu"],
      }),
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/routine/list returns the saved workout routines", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/routine/list")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect([
        {
          id: 31,
          name: "Starter Split",
          scheduledDays: ["Mon", "Thu"],
          difficulty: "Beginner",
        },
      ]);

    expect(workoutServiceMock.listRoutines).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/profile returns the authenticated workout profile", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/profile")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            completed: true,
            profile: expect.objectContaining({
              userUUID: "workout-user-123",
              primaryGoal: "Build muscle",
            }),
          }),
        );
      });

    expect(workoutProfileServiceMock.getProfile).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/profile returns 401 when no authorization header is provided", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/profile")
      .expect(401);
  });

  it("PUT /workout/api/v1/workout/profile updates the workout onboarding profile", async () => {
    await request(app.getHttpServer())
      .put("/workout/api/v1/workout/profile")
      .set("authorization", "Bearer workout-user-123")
      .send({
        weeklyWorkouts: 4,
        primaryGoal: "Lose fat",
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            completed: true,
            profile: expect.objectContaining({
              userUUID: "workout-user-123",
              weeklyWorkouts: 4,
              primaryGoal: "Lose fat",
            }),
          }),
        );
      });

    expect(workoutProfileServiceMock.upsertProfile).toHaveBeenCalledWith(
      "workout-user-123",
      expect.objectContaining({
        weeklyWorkouts: 4,
        primaryGoal: "Lose fat",
      }),
    );
  });

  it("POST /workout/api/v1/workout/progress/create creates a workout progress entry", async () => {
    await request(app.getHttpServer())
      .post("/workout/api/v1/workout/progress/create")
      .set("authorization", "Bearer workout-user-123")
      .send({
        weight: 78.5,
        bodyFatPercentage: 16.2,
        notes: "Felt stronger this week",
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 81,
            userUUID: "workout-user-123",
            weight: 78.5,
            bodyFatPercentage: 16.2,
          }),
        );
      });

    expect(workoutServiceMock.createProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        weight: 78.5,
        bodyFatPercentage: 16.2,
        notes: "Felt stronger this week",
      }),
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/progress/list returns the workout progress history", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/progress/list")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect([
        {
          id: 81,
          userUUID: "workout-user-123",
          weight: 78.5,
          bodyFatPercentage: 16.2,
          notes: "Felt stronger this week",
        },
      ]);

    expect(workoutServiceMock.listProgress).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/dashboard/summary returns dashboard metrics for the workout user", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/dashboard/summary")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            totalWorkouts: 14,
            currentStreak: 4,
            favoriteWorkout: "Upper Body Push",
            improvementAreas: ["mobility", "cardio"],
          }),
        );
      });

    expect(workoutServiceMock.getDashboardSummary).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/progress/metrics returns weekly and monthly workout chart data", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/progress/metrics")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            weeklyData: expect.any(Array),
            monthlyData: expect.any(Array),
          }),
        );
        expect(response.body.weeklyData[0]).toEqual(
          expect.objectContaining({
            day: "Mon",
            workouts: 1,
          }),
        );
      });

    expect(workoutServiceMock.getProgressMetrics).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/diary returns the saved workout journal timeline", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/diary")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect([
        {
          id: 90,
          userUUID: "workout-user-123",
          title: "Week 4 check-in",
          content: "Stamina is improving.",
          mood: "energized",
          favorite: false,
        },
      ]);

    expect(diaryServiceMock.listEntries).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("POST /workout/api/v1/diary creates a progress journal entry for the workout user", async () => {
    await request(app.getHttpServer())
      .post("/workout/api/v1/diary")
      .set("authorization", "Bearer workout-user-123")
      .send({
        title: "Week 4 check-in",
        content: "Stamina is improving.",
        mood: "energized",
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 90,
            userUUID: "workout-user-123",
            title: "Week 4 check-in",
            mood: "energized",
          }),
        );
      });

    expect(diaryServiceMock.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Week 4 check-in",
        content: "Stamina is improving.",
        mood: "energized",
      }),
      "workout-user-123",
    );
  });

  it("PUT /workout/api/v1/diary/:id updates an existing workout journal entry", async () => {
    await request(app.getHttpServer())
      .put("/workout/api/v1/diary/90")
      .set("authorization", "Bearer workout-user-123")
      .send({
        title: "Week 4 reflection",
        content: "Recovery and stamina are improving.",
        mood: "focused",
        favorite: true,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 90,
            userUUID: "workout-user-123",
            title: "Week 4 reflection",
            mood: "focused",
            favorite: true,
          }),
        );
      });

    expect(diaryServiceMock.updateEntry).toHaveBeenCalledWith(
      90,
      "workout-user-123",
      expect.objectContaining({
        title: "Week 4 reflection",
        content: "Recovery and stamina are improving.",
        mood: "focused",
        favorite: true,
      }),
    );
  });

  it("PUT /workout/api/v1/diary/:id/favorite toggles a workout journal entry favorite flag", async () => {
    await request(app.getHttpServer())
      .put("/workout/api/v1/diary/90/favorite")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: 90,
            userUUID: "workout-user-123",
            favorite: true,
          }),
        );
      });

    expect(diaryServiceMock.toggleFavorite).toHaveBeenCalledWith(
      90,
      "workout-user-123",
    );
  });

  it("GET /workout/api/v1/workout/reminder returns the saved workout reminder configuration", async () => {
    await request(app.getHttpServer())
      .get("/workout/api/v1/workout/reminder")
      .set("authorization", "Bearer workout-user-123")
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            enabled: true,
            timeOfDay: "18:00",
            days: ["Mon", "Wed", "Fri"],
          }),
        );
      });

    expect(workoutServiceMock.getReminder).toHaveBeenCalledWith(
      "workout-user-123",
    );
  });

  it("PUT /workout/api/v1/workout/reminder updates the workout reminder configuration", async () => {
    await request(app.getHttpServer())
      .put("/workout/api/v1/workout/reminder")
      .set("authorization", "Bearer workout-user-123")
      .send({
        enabled: true,
        timeOfDay: "06:30",
        days: ["Tue", "Thu", "Sat"],
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            userUUID: "workout-user-123",
            enabled: true,
            timeOfDay: "06:30",
            days: ["Tue", "Thu", "Sat"],
          }),
        );
      });

    expect(workoutServiceMock.setReminder).toHaveBeenCalledWith(
      "workout-user-123",
      expect.objectContaining({
        enabled: true,
        timeOfDay: "06:30",
        days: ["Tue", "Thu", "Sat"],
      }),
    );
  });
});
