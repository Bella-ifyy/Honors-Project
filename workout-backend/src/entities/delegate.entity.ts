import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "delegates" })
export class DelegateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerUUID: string;

  @Column()
  delegateUUID: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
