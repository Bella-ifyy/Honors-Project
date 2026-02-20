import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "routine_exercises" })
export class RoutineExerciseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  routineId: number;

  @Column()
  exerciseId: number;

  @Column({ nullable: true })
  targetSets: number;

  @Column({ nullable: true })
  targetReps: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  targetWeight: number;

  @Column({ nullable: true })
  targetDuration: number;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ nullable: true })
  restTime: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
