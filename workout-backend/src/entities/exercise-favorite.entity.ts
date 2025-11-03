import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: "exercise_favorites" })
@Index(["userUUID", "exerciseId"], { unique: true })
export class ExerciseFavoriteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column()
  exerciseId: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
