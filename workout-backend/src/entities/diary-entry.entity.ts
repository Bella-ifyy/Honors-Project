import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "diary_entries" })
export class DiaryEntryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: "longtext" })
  content: string;

  @Column({ length: 32, default: "reflective" })
  mood: string;

  @Column({ type: "simple-array", nullable: true })
  tags?: string[];

  @Column({ default: false })
  favorite: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
