import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity({ name: "tasks" })
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ default: "Medium" })
  priority: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ nullable: true })
  recurringPattern: string;

  @Column({ nullable: true })
  recurringEndDate: Date;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @Column()
  userUUID: string;

  @Column({ nullable: true })
  createdByApiKeyId: number;

  @Column({ nullable: true })
  createdVia: string;
}
