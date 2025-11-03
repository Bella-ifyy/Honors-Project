import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "note_shares" })
export class NoteShareEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  noteId: number;

  @Column()
  ownerUUID: string;

  @Column()
  delegateUUID: string;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
