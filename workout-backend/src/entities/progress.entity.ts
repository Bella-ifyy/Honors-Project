import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "user_progress" })
export class ProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column()
  date: Date;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  weight: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  bodyFatPercentage: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  muscleMass: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  measurements: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
