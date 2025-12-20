import { ITaskRepository } from "../../repositories/ITaskRepository";

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await this.taskRepository.delete(id);
  }
}
