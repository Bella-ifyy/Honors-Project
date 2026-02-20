import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkoutProfileEntity } from "../../entities/workout-profile.entity";
import { UserEntity } from "../../entities/user.entity";

@Injectable()
export class WorkoutProfileService {
  constructor(
    @InjectRepository(WorkoutProfileEntity)
    private readonly profileRepository: Repository<WorkoutProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private encodeList(value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (Array.isArray(value)) {
      return value.length ? JSON.stringify(value) : null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([trimmed]);
      } catch (_error) {
        return JSON.stringify([trimmed]);
      }
    }
    return JSON.stringify([String(value)]);
  }

  private decodeList(value: string | null): string[] {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch (_error) {
      return value.split(",").map(item => item.trim()).filter(Boolean);
    }
  }

  async getProfile(userUUID: string) {
    const profile = await this.profileRepository.findOne({ userUUID });
    if (!profile) {
      return { profile: null, completed: false };
    }

    return {
      completed: true,
      profile: {
        ...profile,
        workoutTypes: this.decodeList(profile.workoutTypes),
        targetAreas: this.decodeList(profile.targetAreas),
        equipmentAccess: this.decodeList(profile.equipmentAccess),
      },
    };
  }

  async upsertProfile(userUUID: string, payload: any) {
    const data: Partial<WorkoutProfileEntity> = {
      userUUID,
      age: this.toNumber(payload.age),
      gender: payload.gender ?? null,
      heightCm: this.toNumber(payload.heightCm),
      weightKg: this.toNumber(payload.weightKg),
      bodyFatPercentage: this.toNumber(payload.bodyFatPercentage),
      activityLevel: payload.activityLevel ?? null,
      experienceLevel: payload.experienceLevel ?? null,
      primaryGoal: payload.primaryGoal ?? null,
      weeklyWorkouts: this.toNumber(payload.weeklyWorkouts),
      sessionDurationMinutes: this.toNumber(payload.sessionDurationMinutes),
      workoutTypes: this.encodeList(payload.workoutTypes),
      targetAreas: this.encodeList(payload.targetAreas),
      equipmentAccess: this.encodeList(payload.equipmentAccess),
      injuries: payload.injuries ?? null,
      medicalConditions: payload.medicalConditions ?? null,
      sleepHours: this.toNumber(payload.sleepHours),
      stressLevel: payload.stressLevel ?? null,
      nutritionFocus: payload.nutritionFocus ?? null,
      hydrationLiters: this.toNumber(payload.hydrationLiters),
      restingHeartRate: this.toNumber(payload.restingHeartRate),
      stepGoal: this.toNumber(payload.stepGoal),
      timezone: payload.timezone ?? null,
      units: payload.units ?? null,
    };

    const existing = await this.profileRepository.findOne({ userUUID });
    const saved = existing
      ? await this.profileRepository.save({ ...existing, ...data })
      : await this.profileRepository.save(this.profileRepository.create(data));

    await this.userRepository.update(
      { uuid: userUUID },
      { workoutOnboardingCompleted: true },
    );

    return {
      completed: true,
      profile: {
        ...saved,
        workoutTypes: this.decodeList(saved.workoutTypes),
        targetAreas: this.decodeList(saved.targetAreas),
        equipmentAccess: this.decodeList(saved.equipmentAccess),
      },
    };
  }
}
