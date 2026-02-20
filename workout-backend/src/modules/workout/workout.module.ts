import { Module } from "@nestjs/common";
import { WorkoutService } from "./workout.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkoutEntity } from "../../entities/workout.entity";
import { WorkoutController } from "./workout.controller";
import { PublicWorkoutController } from "./public-workout.controller";
import { ExerciseEntity } from "../../entities/exercise.entity";
import { WorkoutExerciseEntity } from "../../entities/workout-exercise.entity";
import { WorkoutRoutineEntity } from "../../entities/workout-routine.entity";
import { RoutineExerciseEntity } from "../../entities/routine-exercise.entity";
import { ProgressEntity } from "../../entities/progress.entity";
import { UserEntity } from "../../entities/user.entity";
import { ExerciseFavoriteEntity } from "../../entities/exercise-favorite.entity";
import { RoutineFavoriteEntity } from "../../entities/routine-favorite.entity";
import { WorkoutReminderEntity } from "../../entities/workout-reminder.entity";
import { WorkoutProfileEntity } from "../../entities/workout-profile.entity";
import { AuthModule } from "../auth/auth.module";
import { WorkoutProfileService } from "./workout-profile.service";
import { WorkoutProfileController } from "./workout-profile.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutEntity,
      ExerciseEntity,
      WorkoutExerciseEntity,
      WorkoutRoutineEntity,
      RoutineExerciseEntity,
      ProgressEntity,
      UserEntity,
      ExerciseFavoriteEntity,
      RoutineFavoriteEntity,
      WorkoutReminderEntity,
      WorkoutProfileEntity,
    ]),
    AuthModule,
  ],
  controllers: [WorkoutController, PublicWorkoutController, WorkoutProfileController],
  providers: [WorkoutService, WorkoutProfileService],
  exports: [WorkoutService],
})
export class WorkoutModule {}
