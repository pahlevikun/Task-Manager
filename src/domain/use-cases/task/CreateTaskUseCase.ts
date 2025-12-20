import { ITaskRepository } from "../../repositories/ITaskRepository";
import { Task, TaskStatus } from "../../entities/Task";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z
    .enum(["todo", "in_progress", "done"] as [string, ...string[]])
    .optional(),
  dueDate: z.string().min(1, "Due date is required").or(z.date()),
  userId: z.string().uuid(),
});

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(data: z.infer<typeof createTaskSchema>): Promise<Task> {
    const validatedData = createTaskSchema.parse(data);

    return this.taskRepository.create({
      title: validatedData.title,
      description: validatedData.description || null,
      status: (validatedData.status as TaskStatus) || "todo",
      dueDate: new Date(validatedData.dueDate),
      userId: validatedData.userId,
    });
  }
}
