import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "workouts" })
export class WorkoutEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 0 })
  totalDuration: number;

  @Column({ default: 0 })
  caloriesBurned: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
