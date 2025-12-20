import { ITaskRepository } from "../../repositories/ITaskRepository";
import { Task, TaskStatus } from "../../entities/Task";
import { z } from "zod";

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(), // To verify ownership
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z
    .enum(["todo", "in_progress", "done"] as [string, ...string[]])
    .optional(),
  dueDate: z.string().optional().or(z.date().optional()),
});

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(data: z.infer<typeof updateTaskSchema>): Promise<Task> {
    const validatedData = updateTaskSchema.parse(data);

    const task = await this.taskRepository.findById(validatedData.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== validatedData.userId) {
      throw new Error("Unauthorized");
    }

    const updatedTask = await this.taskRepository.update(validatedData.id, {
      title: validatedData.title,
      description: validatedData.description,
      status: validatedData.status as TaskStatus,
      dueDate: validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : undefined,
    });

    if (!updatedTask) {
      throw new Error("Failed to update task");
    }

    return updatedTask;
  }
}
