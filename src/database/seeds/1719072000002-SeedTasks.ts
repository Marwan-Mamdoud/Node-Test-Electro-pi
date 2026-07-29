import { DataSource } from "typeorm";
import { Task, TaskStatus, TaskPriority } from "../../models/Task";
import { Project } from "../../models/Project";
import { User } from "../../models/User";

export const seedTasks = async (dataSource: DataSource): Promise<void> => {
  const taskRepo = dataSource.getRepository(Task);
  const projectRepo = dataSource.getRepository(Project);
  const userRepo = dataSource.getRepository(User);

  const existing = await taskRepo.findOne({ where: { title: "Sample Task" } });
  if (existing) {
    console.log("Tasks already seeded");
    return;
  }

  const project = await projectRepo.findOne({
    where: { title: "Sample Project" },
  });
  if (!project) {
    console.log("No sample project found, skipping task seed");
    return;
  }

  const admin = await userRepo.findOne({ where: { email: "admin@test.com" } });
  const member = await userRepo.findOne({
    where: { email: "member@test.com" },
  });

  const tasks = [
    {
      title: "Sample Task",
      description: "A high priority TODO task",
      status: "TODO" as TaskStatus,
      priority: "high" as TaskPriority,
      dueDate: new Date("2026-07-01"),
      projectId: project.id,
      creatorId: admin?.id ?? project.ownerId,
      assigneeId: member?.id,
    },
    {
      title: "In Progress Task",
      description: "A medium priority in-progress task",
      status: "IN_PROGRESS" as TaskStatus,
      priority: "medium" as TaskPriority,
      dueDate: new Date("2026-07-15"),
      projectId: project.id,
      creatorId: admin?.id ?? project.ownerId,
      assigneeId: admin?.id,
    },
    {
      title: "Completed Task",
      description: "A low priority done task",
      status: "DONE" as TaskStatus,
      priority: "low" as TaskPriority,
      dueDate: new Date("2026-06-20"),
      projectId: project.id,
      creatorId: admin?.id ?? project.ownerId,
    },
  ];

  await taskRepo.save(tasks);
  console.log("✅ Tasks seeded");
};
