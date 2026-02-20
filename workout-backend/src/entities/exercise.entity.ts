import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "exercises" })
export class ExerciseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  targetMuscles: string;

  @Column({ nullable: true })
  equipment: string;

  @Column({ default: "Medium" })
  difficulty: string;

  @Column({ nullable: true })
  instructions: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ default: true })
  isPreDefined: boolean;

  @Column({ nullable: true })
  createdByUserUUID: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
