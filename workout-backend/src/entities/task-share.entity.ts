import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "task_shares" })
export class TaskShareEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @Column()
  ownerUUID: string;

  @Column()
  delegateUUID: string;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
