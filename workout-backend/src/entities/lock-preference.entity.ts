import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({ name: "lock_preferences" })
@Unique(["userUUID"])
export class LockPreferenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column({ default: false })
  appLockEnabled: boolean;

  @Column({ default: false })
  diaryLockEnabled: boolean;

  @Column({ default: false })
  tasksLockEnabled: boolean;

  @Column({ default: false })
  notesLockEnabled: boolean;

  @Column({ default: false })
  requireBiometrics: boolean;

  @Column({ default: false })
  diaryModuleEnabled: boolean;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ type: "timestamp", nullable: true })
  passwordUpdatedAt?: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
