import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: "routine_favorites" })
@Index(["userUUID", "routineId"], { unique: true })
export class RoutineFavoriteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column()
  routineId: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
