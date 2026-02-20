import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "workout_profiles" })
export class WorkoutProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column({ type: "int", nullable: true })
  age: number | null;

  @Column({ nullable: true })
  gender: string | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  heightCm: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  weightKg: number | null;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  bodyFatPercentage: number | null;

  @Column({ nullable: true })
  activityLevel: string | null;

  @Column({ nullable: true })
  experienceLevel: string | null;

  @Column({ nullable: true })
  primaryGoal: string | null;

  @Column({ type: "int", nullable: true })
  weeklyWorkouts: number | null;

  @Column({ type: "int", nullable: true })
  sessionDurationMinutes: number | null;

  @Column({ type: "text", nullable: true })
  workoutTypes: string | null;

  @Column({ type: "text", nullable: true })
  targetAreas: string | null;

  @Column({ type: "text", nullable: true })
  equipmentAccess: string | null;

  @Column({ type: "text", nullable: true })
  injuries: string | null;

  @Column({ type: "text", nullable: true })
  medicalConditions: string | null;

  @Column({ type: "decimal", precision: 4, scale: 2, nullable: true })
  sleepHours: number | null;

  @Column({ nullable: true })
  stressLevel: string | null;

  @Column({ nullable: true })
  nutritionFocus: string | null;

  @Column({ type: "decimal", precision: 4, scale: 2, nullable: true })
  hydrationLiters: number | null;

  @Column({ type: "int", nullable: true })
  restingHeartRate: number | null;

  @Column({ type: "int", nullable: true })
  stepGoal: number | null;

  @Column({ nullable: true })
  timezone: string | null;

  @Column({ nullable: true })
  units: string | null;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
