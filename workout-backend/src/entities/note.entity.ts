import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity({ name: "notes" })
export class NoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "longtext" })
  content: string;

  @Column()
  userUUID: string;

  @Column({ type: "simple-array", nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  taskId: number;

  @Column({ nullable: true })
  createdByApiKeyId: number;

  @Column({ nullable: true })
  createdVia: string;
}
