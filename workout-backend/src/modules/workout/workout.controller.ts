import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { WorkoutService } from "./workout.service";

@Controller("workout")
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  private resolveUserUUID(req: ExpressRequest, authHeader?: string): string {
    return req.user?.uuid || authHeader || "";
  }

  @Post("create")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWorkout(
    @Req() req: ExpressRequest,
    @Body() createWorkoutDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.createWorkout(createWorkoutDto, userUUID);
  }

  @Put(":id(\\d+)")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateWorkout(
    @Req() req: ExpressRequest,
    @Param("id") workoutId: string,
    @Body() updateWorkoutDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.updateWorkout(Number(workoutId), updateWorkoutDto, userUUID);
  }

  @Get("list")
  @UseGuards(AuthGuard)
  async listWorkouts(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.listWorkouts(userUUID);
  }

  @Post("exercise/create")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createExercise(
    @Req() req: ExpressRequest,
    @Body() createExerciseDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.createExercise(createExerciseDto, userUUID);
  }

  @Get("exercise/list")
  async listExercises() {
    return await this.workoutService.listExercises();
  }

  @Get("exercise/:id")
  async getExercise(@Param("id") exerciseId: string) {
    return await this.workoutService.getExercise(Number(exerciseId));
  }

  @Get("exercise/favorites")
  @UseGuards(AuthGuard)
  async listFavoriteExercises(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.listFavoriteExercises(userUUID);
  }

  @Put("exercise/:id/favorite")
  @UseGuards(AuthGuard)
  async toggleExerciseFavorite(
    @Req() req: ExpressRequest,
    @Param("id") exerciseId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.toggleExerciseFavorite(Number(exerciseId), userUUID);
  }

  @Post("routine/create")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRoutine(
    @Req() req: ExpressRequest,
    @Body() createRoutineDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.createRoutine(createRoutineDto, userUUID);
  }

  @Get("routine/list")
  @UseGuards(AuthGuard)
  async listRoutines(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.listRoutines(userUUID);
  }

  @Get("routine/:id")
  @UseGuards(AuthGuard)
  async getRoutine(
    @Req() req: ExpressRequest,
    @Param("id") routineId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.getRoutine(Number(routineId), userUUID);
  }

  @Put("routine/:id")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateRoutine(
    @Req() req: ExpressRequest,
    @Param("id") routineId: string,
    @Body() updateRoutineDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.updateRoutine(Number(routineId), updateRoutineDto, userUUID);
  }

  @Delete("routine/:id")
  @UseGuards(AuthGuard)
  async deleteRoutine(
    @Req() req: ExpressRequest,
    @Param("id") routineId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.deleteRoutine(Number(routineId), userUUID);
  }

  @Get("routine/favorites/list")
  @UseGuards(AuthGuard)
  async listFavoriteRoutines(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.listFavoriteRoutines(userUUID);
  }

  @Put("routine/:id/favorite")
  @UseGuards(AuthGuard)
  async toggleRoutineFavorite(
    @Req() req: ExpressRequest,
    @Param("id") routineId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.toggleRoutineFavorite(Number(routineId), userUUID);
  }

  @Post("progress/create")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createProgress(
    @Req() req: ExpressRequest,
    @Body() createProgressDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.createProgress(createProgressDto, userUUID);
  }

  @Get("progress/list")
  @UseGuards(AuthGuard)
  async listProgress(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.listProgress(userUUID);
  }

  @Get("progress/metrics")
  @UseGuards(AuthGuard)
  async getProgressMetrics(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.getProgressMetrics(userUUID);
  }

  @Get("dashboard/summary")
  @UseGuards(AuthGuard)
  async getDashboardSummary(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.getDashboardSummary(userUUID);
  }

  @Get("dashboard/recent")
  @UseGuards(AuthGuard)
  async getRecentWorkouts(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.getRecentWorkouts(userUUID);
  }

  @Get("reminder")
  @UseGuards(AuthGuard)
  async getReminder(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.getReminder(userUUID);
  }

  @Put("reminder")
  @UseGuards(AuthGuard)
  async setReminder(
    @Req() req: ExpressRequest,
    @Body() payload: { enabled?: boolean; timeOfDay?: string; days?: string[] },
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.setReminder(userUUID, payload);
  }

  @Get(":id(\\d+)")
  @UseGuards(AuthGuard)
  async getWorkout(
    @Req() req: ExpressRequest,
    @Param("id") workoutId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.getWorkout(Number(workoutId), userUUID);
  }

  @Delete(":id(\\d+)")
  @UseGuards(AuthGuard)
  async deleteWorkout(
    @Req() req: ExpressRequest,
    @Param("id") workoutId: string,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = this.resolveUserUUID(req, authHeader);
    return await this.workoutService.deleteWorkout(Number(workoutId), userUUID);
  }
}
