import { Task } from '../../entities/Task';
import { ITaskRepository } from '../../repositories/ITaskRepository';

export class GetTaskByIdUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return task;
  }
}
