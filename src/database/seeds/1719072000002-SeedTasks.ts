import { DataSource } from "typeorm";
import { Task, TaskStatus, TaskPriority } from "../../models/Task";
import { Project } from "../../models/Project";

export const seedTasks = async (dataSource: DataSource): Promise<void> => {
  const taskRepo = dataSource.getRepository(Task);
  const projectRepo = dataSource.getRepository(Project);

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

  const tasks = [
    {
      title: "Sample Task",
      description: "A high priority pending task",
      status: "pending" as TaskStatus,
      priority: "high" as TaskPriority,
      dueDate: new Date("2026-07-01"),
      projectId: project.id,
    },
    {
      title: "In Progress Task",
      description: "A medium priority in-progress task",
      status: "in_progress" as TaskStatus,
      priority: "medium" as TaskPriority,
      dueDate: new Date("2026-07-15"),
      projectId: project.id,
    },
    {
      title: "Completed Task",
      description: "A low priority completed task",
      status: "done" as TaskStatus,
      priority: "low" as TaskPriority,
      dueDate: new Date("2026-06-20"),
      projectId: project.id,
    },
  ];

  await taskRepo.save(tasks);
  console.log("✅ Tasks seeded");
};
