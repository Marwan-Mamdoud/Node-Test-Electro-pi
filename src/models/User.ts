import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Project } from "./Project";

export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 100,
  })
  name: string;

  @Index()
  @Column({
    unique: true,
    length: 255,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
  })
  updatedAt: Date;
}
