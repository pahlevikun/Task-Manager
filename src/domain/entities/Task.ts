export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
