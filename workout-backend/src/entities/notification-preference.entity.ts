import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "notification_preferences" })
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userUUID: string;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  taskReminders: boolean;

  @Column({ default: true })
  taskReminderEmail: boolean;

  @Column({ default: true })
  taskReminderPush: boolean;

  @Column({ default: 60 })
  reminderMinutesBefore: number; // How many minutes before due date to send reminder

  @Column({ default: true })
  dailyDigest: boolean;

  @Column({ default: "09:00" })
  dailyDigestTime: string;

  @Column({ default: true })
  dailyPlanningPush: boolean;

  @Column({ default: true })
  dailyPlanningEmail: boolean;

  @Column({ default: "08:00" })
  dailyPlanningTime: string;

  @Column({ nullable: true })
  dailyPlanningLastSent: Date;

  @Column({ default: true })
  eveningReviewPush: boolean;

  @Column({ default: true })
  eveningReviewEmail: boolean;

  @Column({ default: "20:00" })
  eveningReviewTime: string;

  @Column({ nullable: true })
  eveningReviewLastSent: Date;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
