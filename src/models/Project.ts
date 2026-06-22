import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Task } from "./Task";

export enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 255,
  })
  title: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description?: string;

  @Index()
  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @Index()
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "ownerId",
  })
  owner: User;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
  })
  updatedAt: Date;
}
