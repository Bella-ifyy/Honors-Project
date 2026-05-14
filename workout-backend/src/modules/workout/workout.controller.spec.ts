import { WorkoutController } from "./workout.controller";

describe("WorkoutController", () => {
  it("creates a workout using the authenticated workout user uuid", async () => {
    const workoutService = {
      createWorkout: jest.fn().mockResolvedValue({ id: 1, name: "Upper Body" }),
    };
    const controller = new WorkoutController(workoutService as any);

    const result = await controller.createWorkout(
      { user: { uuid: "workout-user-123" } } as any,
      { name: "Upper Body" },
      "Bearer ignored-token",
    );

    expect(workoutService.createWorkout).toHaveBeenCalledWith(
      { name: "Upper Body" },
      "workout-user-123",
    );
    expect(result).toEqual({ id: 1, name: "Upper Body" });
  });

  it("falls back to the authorization header when the workout request has no attached user", async () => {
    const workoutService = {
      listWorkouts: jest.fn().mockResolvedValue([]),
    };
    const controller = new WorkoutController(workoutService as any);

    await controller.listWorkouts(
      { user: undefined } as any,
      "user-from-header",
    );

    expect(workoutService.listWorkouts).toHaveBeenCalledWith(
      "user-from-header",
    );
  });
});
