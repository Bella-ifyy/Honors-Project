import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "workout_exercises" })
export class WorkoutExerciseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workoutId: number;

  @Column()
  exerciseId: number;

  @Column({ nullable: true })
  sets: number;

  @Column({ nullable: true })
  reps: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  weight: number;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  distance: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
