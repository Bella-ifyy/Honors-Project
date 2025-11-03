import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "api_keys" })
export class ApiKeyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userUUID: string;

  @Column({ length: 24 })
  prefix: string;

  @Column({ length: 64 })
  keyHash: string;

  @Column({ default: "" })
  name: string;

  @Column({ type: "simple-array", nullable: true })
  scopes: string[];

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;
}
