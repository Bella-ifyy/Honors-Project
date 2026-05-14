import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
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

@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(WorkoutEntity)
    private readonly workoutRepository: Repository<WorkoutEntity>,
    @InjectRepository(ExerciseEntity)
    private readonly exerciseRepository: Repository<ExerciseEntity>,
    @InjectRepository(WorkoutExerciseEntity)
    private readonly workoutExerciseRepository: Repository<WorkoutExerciseEntity>,
    @InjectRepository(WorkoutRoutineEntity)
    private readonly routineRepository: Repository<WorkoutRoutineEntity>,
    @InjectRepository(RoutineExerciseEntity)
    private readonly routineExerciseRepository: Repository<RoutineExerciseEntity>,
    @InjectRepository(ProgressEntity)
    private readonly progressRepository: Repository<ProgressEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ExerciseFavoriteEntity)
    private readonly exerciseFavoriteRepository: Repository<ExerciseFavoriteEntity>,
    @InjectRepository(RoutineFavoriteEntity)
    private readonly routineFavoriteRepository: Repository<RoutineFavoriteEntity>,
    @InjectRepository(WorkoutReminderEntity)
    private readonly workoutReminderRepository: Repository<WorkoutReminderEntity>,
  ) {}

  private parseScheduledDays(rawValue: unknown): string[] {
    if (!rawValue) {
      return [];
    }
    if (Array.isArray(rawValue)) {
      return rawValue.filter(
        (day) => typeof day === "string" && day.trim().length > 0,
      );
    }
    if (typeof rawValue === "object") {
      const bag = rawValue as { scheduledDays?: unknown; days?: unknown };
      const nestedValue = bag.scheduledDays ?? bag.days;
      if (Array.isArray(nestedValue)) {
        return nestedValue.filter(
          (day) => typeof day === "string" && day.trim().length > 0,
        );
      }
    }
    if (typeof rawValue !== "string") {
      return [];
    }
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (day) => typeof day === "string" && day.trim().length > 0,
        );
      }
      if (typeof parsed === "string" && parsed.trim().length > 0) {
        return [parsed.trim()];
      }
    } catch (_error) {}

    const fallback = rawValue
      .split(",")
      .map((day) => day.trim())
      .filter((day) => day.length > 0);

    return fallback.length > 0 ? fallback : [];
  }

  private serializeScheduledDays(value: unknown): string | null {
    if (!value) {
      return null;
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === "string") {
      return value.trim().length ? value : null;
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return null;
  }

  private async hydrateWorkoutExercises(workoutId: number) {
    const workoutExercises = await this.workoutExerciseRepository.find({
      where: { workoutId },
      order: { orderIndex: "ASC" },
    });

    if (workoutExercises.length === 0) {
      return [];
    }

    const exerciseIds = workoutExercises.map((ex) => ex.exerciseId);
    const exercises = await this.exerciseRepository.find({
      where: { id: In(exerciseIds) },
    });
    const exerciseMap = new Map(exercises.map((ex) => [ex.id, ex]));

    return workoutExercises.map((item) => ({
      ...item,
      exercise: exerciseMap.get(item.exerciseId) || null,
    }));
  }

  private normalizeDateKey(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async createWorkout(createWorkoutDto: any, authUUID: string) {
    try {
      const workout = new WorkoutEntity();
      workout.userUUID = authUUID;
      workout.date = createWorkoutDto.date || new Date();
      workout.name = createWorkoutDto.name;
      workout.notes = createWorkoutDto.notes;
      workout.totalDuration = createWorkoutDto.totalDuration || 0;
      workout.caloriesBurned = createWorkoutDto.caloriesBurned || 0;
      workout.isCompleted = createWorkoutDto.isCompleted || false;

      const savedWorkout = await this.workoutRepository.save(workout);

      if (Array.isArray(createWorkoutDto.exercises)) {
        for (let i = 0; i < createWorkoutDto.exercises.length; i++) {
          const exerciseData = createWorkoutDto.exercises[i];
          const workoutExercise = new WorkoutExerciseEntity();
          workoutExercise.workoutId = savedWorkout.id;
          workoutExercise.exerciseId = exerciseData.exerciseId;
          workoutExercise.sets = exerciseData.sets;
          workoutExercise.reps = exerciseData.reps;
          workoutExercise.weight = exerciseData.weight;
          workoutExercise.duration = exerciseData.duration;
          workoutExercise.distance = exerciseData.distance;
          workoutExercise.notes = exerciseData.notes;
          workoutExercise.orderIndex = exerciseData.orderIndex ?? i;
          await this.workoutExerciseRepository.save(workoutExercise);
        }
      }

      const hydratedExercises = await this.hydrateWorkoutExercises(
        savedWorkout.id,
      );
      return { ...savedWorkout, exercises: hydratedExercises };
    } catch (error) {
      console.error("Failed to create workout:", error);
      throw new HttpException(
        "Failed to create workout",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateWorkout(
    workoutId: number,
    updateWorkoutDto: any,
    authUUID: string,
  ) {
    try {
      const workout = await this.workoutRepository.findOne({
        where: { id: workoutId, userUUID: authUUID },
      });

      if (!workout) {
        throw new HttpException("Workout not found", HttpStatus.NOT_FOUND);
      }

      workout.date = updateWorkoutDto.date || workout.date;
      workout.name = updateWorkoutDto.name ?? workout.name;
      workout.notes = updateWorkoutDto.notes ?? workout.notes;
      workout.totalDuration =
        updateWorkoutDto.totalDuration ?? workout.totalDuration;
      workout.caloriesBurned =
        updateWorkoutDto.caloriesBurned ?? workout.caloriesBurned;
      workout.isCompleted = updateWorkoutDto.isCompleted ?? workout.isCompleted;
      workout.updatedAt = new Date();

      const savedWorkout = await this.workoutRepository.save(workout);

      if (Array.isArray(updateWorkoutDto.exercises)) {
        await this.workoutExerciseRepository.delete({ workoutId });

        for (let i = 0; i < updateWorkoutDto.exercises.length; i++) {
          const exerciseData = updateWorkoutDto.exercises[i];
          const workoutExercise = new WorkoutExerciseEntity();
          workoutExercise.workoutId = savedWorkout.id;
          workoutExercise.exerciseId = exerciseData.exerciseId;
          workoutExercise.sets = exerciseData.sets;
          workoutExercise.reps = exerciseData.reps;
          workoutExercise.weight = exerciseData.weight;
          workoutExercise.duration = exerciseData.duration;
          workoutExercise.distance = exerciseData.distance;
          workoutExercise.notes = exerciseData.notes;
          workoutExercise.orderIndex = exerciseData.orderIndex ?? i;
          await this.workoutExerciseRepository.save(workoutExercise);
        }
      }

      const hydratedExercises = await this.hydrateWorkoutExercises(
        savedWorkout.id,
      );
      return { ...savedWorkout, exercises: hydratedExercises };
    } catch (error) {
      console.error("Failed to update workout:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update workout",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listWorkouts(authUUID: string) {
    try {
      const workouts = await this.workoutRepository.find({
        where: { userUUID: authUUID },
        order: { date: "DESC" },
      });

      const withExercises = await Promise.all(
        workouts.map(async (workout) => ({
          ...workout,
          exercises: await this.hydrateWorkoutExercises(workout.id),
        })),
      );

      return withExercises;
    } catch (error) {
      console.error("Failed to list workouts:", error);
      throw new HttpException(
        "Failed to list workouts",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorkout(workoutId: number, authUUID: string) {
    try {
      const workout = await this.workoutRepository.findOne({
        where: { id: workoutId, userUUID: authUUID },
      });

      if (!workout) {
        throw new HttpException("Workout not found", HttpStatus.NOT_FOUND);
      }

      const exercises = await this.hydrateWorkoutExercises(workout.id);
      return { ...workout, exercises };
    } catch (error) {
      console.error("Failed to fetch workout:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch workout",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteWorkout(workoutId: number, authUUID: string) {
    try {
      const workout = await this.workoutRepository.findOne({
        where: { id: workoutId, userUUID: authUUID },
      });

      if (!workout) {
        throw new HttpException("Workout not found", HttpStatus.NOT_FOUND);
      }

      await this.workoutExerciseRepository.delete({ workoutId });
      await this.workoutRepository.delete({ id: workoutId });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete workout:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete workout",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createExercise(createExerciseDto: any, authUUID: string) {
    try {
      const exercise = new ExerciseEntity();
      exercise.name = createExerciseDto.name;
      exercise.description = createExerciseDto.description ?? null;
      exercise.type = createExerciseDto.type || "strength";
      exercise.targetMuscles = createExerciseDto.targetMuscles ?? null;
      exercise.equipment = createExerciseDto.equipment ?? null;
      exercise.difficulty = createExerciseDto.difficulty ?? "Medium";
      exercise.instructions = createExerciseDto.instructions ?? null;
      exercise.mediaUrl = createExerciseDto.mediaUrl ?? null;
      exercise.isPreDefined = false;
      exercise.createdByUserUUID = authUUID;

      return await this.exerciseRepository.save(exercise);
    } catch (error) {
      console.error("Failed to create exercise:", error);
      throw new HttpException(
        "Failed to create exercise",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listExercises() {
    try {
      return await this.exerciseRepository.find({
        order: { name: "ASC" },
      });
    } catch (error) {
      console.error("Failed to list exercises:", error);
      throw new HttpException(
        "Failed to list exercises",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getExercise(exerciseId: number) {
    try {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: exerciseId },
      });
      if (!exercise) {
        throw new HttpException("Exercise not found", HttpStatus.NOT_FOUND);
      }
      return exercise;
    } catch (error) {
      console.error("Failed to fetch exercise:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch exercise",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listFavoriteExercises(authUUID: string) {
    try {
      const favorites = await this.exerciseFavoriteRepository.find({
        where: { userUUID: authUUID },
      });
      if (favorites.length === 0) {
        return [];
      }
      const exerciseIds = favorites.map((fav) => fav.exerciseId);
      const exercises = await this.exerciseRepository.find({
        where: { id: In(exerciseIds) },
      });
      return exercises.map((exercise) => ({
        ...exercise,
        isFavorite: true,
      }));
    } catch (error) {
      console.error("Failed to list favorite exercises:", error);
      throw new HttpException(
        "Failed to list favorite exercises",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async toggleExerciseFavorite(exerciseId: number, authUUID: string) {
    try {
      const existing = await this.exerciseFavoriteRepository.findOne({
        where: { userUUID: authUUID, exerciseId },
      });
      if (existing) {
        await this.exerciseFavoriteRepository.delete({ id: existing.id });
        return { isFavorite: false };
      }

      const favorite = new ExerciseFavoriteEntity();
      favorite.userUUID = authUUID;
      favorite.exerciseId = exerciseId;
      await this.exerciseFavoriteRepository.save(favorite);
      return { isFavorite: true };
    } catch (error) {
      console.error("Failed to toggle exercise favorite:", error);
      throw new HttpException(
        "Failed to toggle exercise favorite",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createRoutine(createRoutineDto: any, authUUID: string) {
    try {
      const routine = new WorkoutRoutineEntity();
      routine.userUUID = authUUID;
      routine.name = createRoutineDto.name;
      routine.description = createRoutineDto.description ?? null;
      routine.scheduledDays =
        this.serializeScheduledDays(createRoutineDto.scheduledDays) ?? null;
      routine.isActive = createRoutineDto.isActive ?? true;
      routine.isPreDefined = false;
      routine.difficulty = createRoutineDto.difficulty ?? null;
      routine.estimatedDuration = createRoutineDto.estimatedDuration ?? null;
      routine.estimatedCalories = createRoutineDto.estimatedCalories ?? null;

      const savedRoutine = await this.routineRepository.save(routine);

      if (Array.isArray(createRoutineDto.exercises)) {
        for (let i = 0; i < createRoutineDto.exercises.length; i++) {
          const exerciseData = createRoutineDto.exercises[i];
          const routineExercise = new RoutineExerciseEntity();
          routineExercise.routineId = savedRoutine.id;
          routineExercise.exerciseId = exerciseData.exerciseId;
          routineExercise.targetSets = exerciseData.targetSets ?? null;
          routineExercise.targetReps = exerciseData.targetReps ?? null;
          routineExercise.targetWeight = exerciseData.targetWeight ?? null;
          routineExercise.targetDuration = exerciseData.targetDuration ?? null;
          routineExercise.orderIndex = exerciseData.orderIndex ?? i;
          routineExercise.restTime = exerciseData.restTime ?? null;
          await this.routineExerciseRepository.save(routineExercise);
        }
      }

      const exercises = await this.hydrateRoutineExercises(savedRoutine.id);
      return {
        ...savedRoutine,
        exercises,
        scheduledDays: this.parseScheduledDays(savedRoutine.scheduledDays),
      };
    } catch (error) {
      console.error("Failed to create routine:", error);
      throw new HttpException(
        "Failed to create routine",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async hydrateRoutineExercises(routineId: number) {
    const routineExercises = await this.routineExerciseRepository.find({
      where: { routineId },
      order: { orderIndex: "ASC" },
    });

    if (routineExercises.length === 0) {
      return [];
    }

    const exerciseIds = routineExercises.map((ex) => ex.exerciseId);
    const exercises = await this.exerciseRepository.find({
      where: { id: In(exerciseIds) },
    });
    const exerciseMap = new Map(exercises.map((ex) => [ex.id, ex]));

    return routineExercises.map((item) => ({
      ...item,
      exercise: exerciseMap.get(item.exerciseId) || null,
    }));
  }

  async listRoutines(authUUID: string) {
    try {
      const routines = await this.routineRepository.find({
        where: [{ isPreDefined: true }, { userUUID: authUUID }],
        order: { isPreDefined: "DESC", name: "ASC" },
      });

      const favorites = await this.routineFavoriteRepository.find({
        where: { userUUID: authUUID },
      });
      const favoriteIds = new Set(favorites.map((fav) => fav.routineId));

      const withExercises = await Promise.all(
        routines.map(async (routine) => ({
          ...routine,
          scheduledDays: this.parseScheduledDays(routine.scheduledDays),
          exercises: await this.hydrateRoutineExercises(routine.id),
          isFavorite: favoriteIds.has(routine.id),
        })),
      );

      return withExercises;
    } catch (error) {
      console.error("Failed to list routines:", error);
      throw new HttpException(
        "Failed to list routines",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRoutine(routineId: number, authUUID: string) {
    try {
      const routine = await this.routineRepository.findOne({
        where: { id: routineId },
      });
      if (!routine) {
        throw new HttpException("Routine not found", HttpStatus.NOT_FOUND);
      }

      if (!routine.isPreDefined && routine.userUUID !== authUUID) {
        throw new HttpException("Not authorized", HttpStatus.UNAUTHORIZED);
      }

      const isFavorite = await this.routineFavoriteRepository.findOne({
        where: { routineId, userUUID: authUUID },
      });

      const exercises = await this.hydrateRoutineExercises(routineId);
      return {
        ...routine,
        exercises,
        isFavorite: Boolean(isFavorite),
        scheduledDays: this.parseScheduledDays(routine.scheduledDays),
      };
    } catch (error) {
      console.error("Failed to fetch routine:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch routine",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRoutine(
    routineId: number,
    updateRoutineDto: any,
    authUUID: string,
  ) {
    try {
      const routine = await this.routineRepository.findOne({
        where: { id: routineId },
      });
      if (!routine) {
        throw new HttpException("Routine not found", HttpStatus.NOT_FOUND);
      }
      if (routine.isPreDefined || routine.userUUID !== authUUID) {
        throw new HttpException("Not authorized", HttpStatus.UNAUTHORIZED);
      }

      routine.name = updateRoutineDto.name ?? routine.name;
      routine.description = updateRoutineDto.description ?? routine.description;
      routine.scheduledDays =
        this.serializeScheduledDays(updateRoutineDto.scheduledDays) ??
        routine.scheduledDays;
      routine.isActive = updateRoutineDto.isActive ?? routine.isActive;
      routine.difficulty = updateRoutineDto.difficulty ?? routine.difficulty;
      routine.estimatedDuration =
        updateRoutineDto.estimatedDuration ?? routine.estimatedDuration;
      routine.estimatedCalories =
        updateRoutineDto.estimatedCalories ?? routine.estimatedCalories;
      routine.updatedAt = new Date();

      const savedRoutine = await this.routineRepository.save(routine);

      if (Array.isArray(updateRoutineDto.exercises)) {
        await this.routineExerciseRepository.delete({ routineId });

        for (let i = 0; i < updateRoutineDto.exercises.length; i++) {
          const exerciseData = updateRoutineDto.exercises[i];
          const routineExercise = new RoutineExerciseEntity();
          routineExercise.routineId = savedRoutine.id;
          routineExercise.exerciseId = exerciseData.exerciseId;
          routineExercise.targetSets = exerciseData.targetSets ?? null;
          routineExercise.targetReps = exerciseData.targetReps ?? null;
          routineExercise.targetWeight = exerciseData.targetWeight ?? null;
          routineExercise.targetDuration = exerciseData.targetDuration ?? null;
          routineExercise.orderIndex = exerciseData.orderIndex ?? i;
          routineExercise.restTime = exerciseData.restTime ?? null;
          await this.routineExerciseRepository.save(routineExercise);
        }
      }

      const exercises = await this.hydrateRoutineExercises(savedRoutine.id);
      return {
        ...savedRoutine,
        exercises,
        scheduledDays: this.parseScheduledDays(savedRoutine.scheduledDays),
      };
    } catch (error) {
      console.error("Failed to update routine:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update routine",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRoutine(routineId: number, authUUID: string) {
    try {
      const routine = await this.routineRepository.findOne({
        where: { id: routineId },
      });
      if (!routine) {
        throw new HttpException("Routine not found", HttpStatus.NOT_FOUND);
      }
      if (routine.isPreDefined || routine.userUUID !== authUUID) {
        throw new HttpException("Not authorized", HttpStatus.UNAUTHORIZED);
      }

      await this.routineExerciseRepository.delete({ routineId });
      await this.routineRepository.delete({ id: routineId });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete routine:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete routine",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listFavoriteRoutines(authUUID: string) {
    try {
      const favorites = await this.routineFavoriteRepository.find({
        where: { userUUID: authUUID },
      });
      if (favorites.length === 0) {
        return [];
      }

      const routineIds = favorites.map((fav) => fav.routineId);
      const routines = await this.routineRepository.find({
        where: { id: In(routineIds) },
      });

      const withExercises = await Promise.all(
        routines.map(async (routine) => ({
          ...routine,
          scheduledDays: this.parseScheduledDays(routine.scheduledDays),
          exercises: await this.hydrateRoutineExercises(routine.id),
          isFavorite: true,
        })),
      );

      return withExercises;
    } catch (error) {
      console.error("Failed to list favorite routines:", error);
      throw new HttpException(
        "Failed to list favorite routines",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async toggleRoutineFavorite(routineId: number, authUUID: string) {
    try {
      const existing = await this.routineFavoriteRepository.findOne({
        where: { userUUID: authUUID, routineId },
      });
      if (existing) {
        await this.routineFavoriteRepository.delete({ id: existing.id });
        return { isFavorite: false };
      }

      const favorite = new RoutineFavoriteEntity();
      favorite.userUUID = authUUID;
      favorite.routineId = routineId;
      await this.routineFavoriteRepository.save(favorite);
      return { isFavorite: true };
    } catch (error) {
      console.error("Failed to toggle routine favorite:", error);
      throw new HttpException(
        "Failed to toggle routine favorite",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createProgress(createProgressDto: any, authUUID: string) {
    try {
      const progress = new ProgressEntity();
      progress.userUUID = authUUID;
      progress.date = createProgressDto.date || new Date();
      progress.weight = createProgressDto.weight ?? null;
      progress.bodyFatPercentage = createProgressDto.bodyFatPercentage ?? null;
      progress.muscleMass = createProgressDto.muscleMass ?? null;
      progress.notes = createProgressDto.notes ?? null;
      progress.measurements = createProgressDto.measurements ?? null;
      progress.photoUrl = createProgressDto.photoUrl ?? null;

      return await this.progressRepository.save(progress);
    } catch (error) {
      console.error("Failed to create progress entry:", error);
      throw new HttpException(
        "Failed to create progress",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listProgress(authUUID: string) {
    try {
      return await this.progressRepository.find({
        where: { userUUID: authUUID },
        order: { date: "DESC" },
      });
    } catch (error) {
      console.error("Failed to list progress:", error);
      throw new HttpException(
        "Failed to list progress",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProgressMetrics(authUUID: string) {
    try {
      const workouts = await this.workoutRepository.find({
        where: { userUUID: authUUID },
      });
      const weeklyData = this.buildWeeklyData(workouts);
      const monthlyData = this.buildMonthlyData(workouts);

      return {
        weeklyData,
        monthlyData,
      };
    } catch (error) {
      console.error("Failed to fetch progress metrics:", error);
      throw new HttpException(
        "Failed to fetch progress metrics",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildWeeklyData(workouts: WorkoutEntity[]) {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = labels.map((label) => ({
      day: label,
      workouts: 0,
      calories: 0,
    }));

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      if (Number.isNaN(workoutDate.getTime())) {
        return;
      }
      const offset = Math.floor(
        (workoutDate.getTime() - startOfWeek.getTime()) / 86400000,
      );
      if (offset >= 0 && offset < totals.length) {
        totals[offset].workouts += 1;
        totals[offset].calories += Number(workout.caloriesBurned || 0);
      }
    });

    return totals;
  }

  private buildMonthlyData(workouts: WorkoutEntity[]) {
    const months: { label: string; year: number; monthIndex: number }[] = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleString("en-US", { month: "short" });
      months.push({
        label,
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    const totals = months.map((item) => ({
      month: item.label,
      workouts: 0,
      calories: 0,
    }));

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      if (Number.isNaN(workoutDate.getTime())) {
        return;
      }
      months.forEach((item, index) => {
        if (
          workoutDate.getFullYear() === item.year &&
          workoutDate.getMonth() === item.monthIndex
        ) {
          totals[index].workouts += 1;
          totals[index].calories += Number(workout.caloriesBurned || 0);
        }
      });
    });

    return totals;
  }

  private buildStreaks(workouts: WorkoutEntity[]) {
    const dateSet = new Set(
      workouts
        .map((workout) => this.normalizeDateKey(workout.date))
        .filter((key) => key.length > 0),
    );

    if (dateSet.size === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const dayNumbers = Array.from(dateSet)
      .map((key) => new Date(key).getTime())
      .filter((value) => !Number.isNaN(value))
      .map((value) => Math.floor(value / 86400000))
      .sort((a, b) => a - b);

    let longestStreak = 1;
    let currentRun = 1;

    for (let i = 1; i < dayNumbers.length; i++) {
      if (dayNumbers[i] === dayNumbers[i - 1] + 1) {
        currentRun += 1;
        longestStreak = Math.max(longestStreak, currentRun);
      } else if (dayNumbers[i] !== dayNumbers[i - 1]) {
        currentRun = 1;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let cursor = Math.floor(today.getTime() / 86400000);
    while (
      dateSet.has(new Date(cursor * 86400000).toISOString().slice(0, 10))
    ) {
      currentStreak += 1;
      cursor -= 1;
    }

    return { currentStreak, longestStreak };
  }

  async getDashboardSummary(authUUID: string) {
    try {
      const workouts = await this.workoutRepository.find({
        where: { userUUID: authUUID },
      });

      const totalWorkouts = workouts.length;
      const totalCalories = workouts.reduce(
        (sum, workout) => sum + Number(workout.caloriesBurned || 0),
        0,
      );
      const totalDuration = workouts.reduce(
        (sum, workout) => sum + Number(workout.totalDuration || 0),
        0,
      );
      const completedWorkouts = workouts.filter(
        (workout) => workout.isCompleted,
      ).length;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const weeklyWorkouts = workouts.filter(
        (workout) => new Date(workout.date) >= weekAgo,
      ).length;
      const monthlyWorkouts = workouts.filter(
        (workout) => new Date(workout.date) >= monthAgo,
      ).length;

      const { currentStreak, longestStreak } = this.buildStreaks(workouts);

      const nameCounts = new Map<string, number>();
      workouts.forEach((workout) => {
        const name = workout.name?.trim();
        if (!name) {
          return;
        }
        nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
      });

      let favoriteWorkout = "None";
      let highestCount = 0;
      nameCounts.forEach((count, name) => {
        if (count > highestCount) {
          highestCount = count;
          favoriteWorkout = name;
        }
      });

      const improvementAreas = await this.getImprovementAreas(workouts);

      return {
        totalWorkouts,
        weeklyWorkouts,
        monthlyWorkouts,
        totalCaloriesBurned: totalCalories,
        totalDuration,
        completedWorkouts,
        currentStreak,
        longestStreak,
        favoriteWorkout,
        improvementAreas,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
      throw new HttpException(
        "Failed to fetch dashboard summary",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getImprovementAreas(workouts: WorkoutEntity[]) {
    if (workouts.length === 0) {
      return [];
    }

    const workoutIds = workouts.map((workout) => workout.id);
    const workoutExercises = await this.workoutExerciseRepository.find({
      where: { workoutId: In(workoutIds) },
    });

    if (workoutExercises.length === 0) {
      return [];
    }

    const exerciseIds = Array.from(
      new Set(workoutExercises.map((ex) => ex.exerciseId)),
    );
    const exercises = await this.exerciseRepository.find({
      where: { id: In(exerciseIds) },
    });
    const typeMap = new Map(
      exercises.map((ex) => [ex.id, (ex.type || "").toLowerCase()]),
    );

    const counts = new Map<string, number>();
    workoutExercises.forEach((item) => {
      const type = typeMap.get(item.exerciseId) || "other";
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });

    const sorted = Array.from(counts.entries()).sort((a, b) => a[1] - b[1]);
    return sorted.slice(0, 2).map(([type]) => type);
  }

  async getRecentWorkouts(authUUID: string) {
    try {
      const workouts = await this.workoutRepository.find({
        where: { userUUID: authUUID },
        order: { date: "DESC" },
        take: 5,
      });

      const withExercises = await Promise.all(
        workouts.map(async (workout) => ({
          ...workout,
          exercises: await this.hydrateWorkoutExercises(workout.id),
        })),
      );

      return withExercises;
    } catch (error) {
      console.error("Failed to fetch recent workouts:", error);
      throw new HttpException(
        "Failed to fetch recent workouts",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorkoutTemplates() {
    try {
      const templates = await this.routineRepository.find({
        where: { isPreDefined: true },
        order: { difficulty: "ASC", name: "ASC" },
      });

      const templatesWithDetails = await Promise.all(
        templates.map(async (template) => ({
          ...template,
          scheduledDays: this.parseScheduledDays(template.scheduledDays),
          exercises: await this.hydrateRoutineExercises(template.id),
        })),
      );

      return templatesWithDetails;
    } catch (error) {
      console.error("Failed to fetch workout templates:", error);
      throw new HttpException(
        "Failed to fetch workout templates",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReminder(authUUID: string) {
    try {
      const reminder = await this.workoutReminderRepository.findOne({
        where: { userUUID: authUUID },
      });
      if (!reminder) {
        return {
          enabled: false,
          timeOfDay: null,
          days: [],
        };
      }

      return {
        ...reminder,
        days: this.parseScheduledDays(reminder.days),
      };
    } catch (error) {
      console.error("Failed to fetch workout reminder:", error);
      throw new HttpException(
        "Failed to fetch reminder",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setReminder(
    authUUID: string,
    payload: { enabled?: boolean; timeOfDay?: string; days?: string[] },
  ) {
    try {
      const existing = await this.workoutReminderRepository.findOne({
        where: { userUUID: authUUID },
      });
      const reminder = existing ?? new WorkoutReminderEntity();

      reminder.userUUID = authUUID;
      reminder.enabled = payload.enabled ?? reminder.enabled ?? true;
      reminder.timeOfDay = payload.timeOfDay ?? reminder.timeOfDay ?? null;
      reminder.days =
        this.serializeScheduledDays(payload.days) ?? reminder.days ?? null;
      reminder.updatedAt = new Date();

      const saved = await this.workoutReminderRepository.save(reminder);
      return {
        ...saved,
        days: this.parseScheduledDays(saved.days),
      };
    } catch (error) {
      console.error("Failed to update workout reminder:", error);
      throw new HttpException(
        "Failed to update reminder",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
