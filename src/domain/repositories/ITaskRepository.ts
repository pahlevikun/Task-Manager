import { Task, TaskStatus } from "../entities/Task";

export interface ITaskRepository {
  create(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
  update(
    id: string,
    task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">>
  ): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  findByUserIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]>;
}
