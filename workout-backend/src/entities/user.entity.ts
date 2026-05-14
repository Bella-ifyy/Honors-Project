import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  uuid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: "[]" })
  roles: string;

  @Column({ default: "" })
  bio: string;

  @Column({ default: "" })
  image: string;

  @Column({ default: false })
  workoutOnboardingCompleted: boolean;

  @Column()
  password: string;

  @BeforeInsert()
  generateUUID() {
    if (!this.uuid) {
      this.uuid = uuidv4();
      console.log("Generated UUID:", this.uuid);
    }
  }
}
