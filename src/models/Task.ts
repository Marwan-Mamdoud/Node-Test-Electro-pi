import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Project } from "./Project";

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

@Entity("tasks")
export class Task {
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
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Index()
  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Index()
  @Column({
    type: "date",
    nullable: true,
  })
  dueDate?: Date;

  @Index()
  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "projectId",
  })
  project: Project;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
  })
  updatedAt: Date;
}
