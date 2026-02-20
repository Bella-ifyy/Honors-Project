import { Controller, Get } from "@nestjs/common";
import { WorkoutService } from "./workout.service";

@Controller("public/workout")
export class PublicWorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get("templates")
  async getWorkoutTemplates() {
    return await this.workoutService.getWorkoutTemplates();
  }
}
