import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "workout_routines" })
export class WorkoutRoutineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userUUID: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  scheduledDays: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPreDefined: boolean;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ nullable: true })
  estimatedDuration: number;

  @Column({ nullable: true })
  estimatedCalories: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
