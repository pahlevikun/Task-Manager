import { ITaskRepository } from "../../repositories/ITaskRepository";
import { Task, TaskStatus } from "../../entities/Task";

export class GetTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string, status?: TaskStatus): Promise<Task[]> {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (status) {
      return this.taskRepository.findByUserIdAndStatus(userId, status);
    }
    return this.taskRepository.findByUserId(userId);
  }
}
