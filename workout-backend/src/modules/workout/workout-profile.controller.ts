import { Controller, Get, Put, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "@app/guards/auth.guard";
import { User } from "../auth/decorators/user.decorator";
import { WorkoutProfileService } from "./workout-profile.service";

@Controller("workout/profile")
export class WorkoutProfileController {
  constructor(private readonly workoutProfileService: WorkoutProfileService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@User("uuid") userUUID: string) {
    return await this.workoutProfileService.getProfile(userUUID);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateProfile(@User("uuid") userUUID: string, @Body() payload: any) {
    return await this.workoutProfileService.upsertProfile(userUUID, payload);
  }
}
