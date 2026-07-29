import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Task, TaskStatus } from "./Task";
import { User } from "./User";

@Entity("task_audit_logs")
export class TaskAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  taskId: string;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task: Task;

  @Column()
  changedBy: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "changedBy" })
  user: User;

  @Column({ type: "enum", enum: TaskStatus })
  oldStatus: TaskStatus;

  @Column({ type: "enum", enum: TaskStatus })
  newStatus: TaskStatus;

  @CreateDateColumn({ type: "timestamptz" })
  changedAt: Date;
}
