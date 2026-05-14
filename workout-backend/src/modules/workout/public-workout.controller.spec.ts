import { PublicWorkoutController } from "./public-workout.controller";

describe("PublicWorkoutController", () => {
  it("returns predefined workout templates for the workout app", async () => {
    const workoutService = {
      getWorkoutTemplates: jest
        .fn()
        .mockResolvedValue([
          { id: 1, name: "Beginner Full Body", difficulty: "Beginner" },
        ]),
    };
    const controller = new PublicWorkoutController(workoutService as any);

    const result = await controller.getWorkoutTemplates();

    expect(workoutService.getWorkoutTemplates).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { id: 1, name: "Beginner Full Body", difficulty: "Beginner" },
    ]);
  });
});
