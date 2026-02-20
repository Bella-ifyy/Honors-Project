import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "workout_reminders" })
export class WorkoutReminderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ nullable: true })
  timeOfDay: string;

  @Column({ nullable: true })
  days: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
