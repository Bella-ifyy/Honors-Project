import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PushDeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ nullable: true })
  userUUID: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
