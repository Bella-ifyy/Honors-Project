import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "exercises" })
export class ExerciseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column() // 'cardio', 'strength', 'flexibility', 'sports'
  type: string;

  @Column({ nullable: true }) // Muscle groups targeted
  targetMuscles: string;

  @Column({ nullable: true }) // Equipment needed (e.g., 'dumbbell', 'barbell', 'none')
  equipment: string;

  @Column({ default: "Medium" }) // Difficulty level
  difficulty: string;

  @Column({ nullable: true }) // Instructions or tips
  instructions: string;

  @Column({ nullable: true }) // URL to demonstration video or image
  mediaUrl: string;

  @Column({ default: true }) // Pre-defined exercises vs user-created
  isPreDefined: boolean;

  @Column({ nullable: true }) // UUID of user who created custom exercise
  createdByUserUUID: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
